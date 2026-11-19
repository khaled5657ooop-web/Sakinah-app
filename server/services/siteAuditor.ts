import { GoogleGenAI, Type } from '@google/genai';
import { db, getActiveSiteConfig, type SiteRuntimeConfig } from '../db.ts';
import { recordSystemAlert } from './alerts.ts';

export interface AuditIssue {
  code: string;
  severity: 'info' | 'warning' | 'error';
  area: 'routes' | 'performance' | 'mobile' | 'security' | 'sources' | 'telemetry';
  titleAr: string;
  detailsAr: string;
}

interface RouteCheckResult {
  path: string;
  status: number;
  latencyMs: number;
  ok: boolean;
}

const ROUTES_TO_CHECK = [
  '/',
  '/?section=quran',
  '/?section=listen',
  '/?section=adhkar',
  '/?section=hadith',
  '/?section=prayer',
  '/?section=install',
  '/api/content/daily',
  '/api/site/config',
  '/manifest.webmanifest',
  '/offline.html',
  '/robots.txt',
  '/sitemap.xml',
];

async function checkInternalRoutes(port: number): Promise<RouteCheckResult[]> {
  const results: RouteCheckResult[] = [];
  for (const route of ROUTES_TO_CHECK) {
    const start = performance.now();
    try {
      const res = await fetch(`http://127.0.0.1:${port}${route}`, {
        signal: AbortSignal.timeout(5000),
      });
      const latencyMs = Math.round(performance.now() - start);
      results.push({
        path: route,
        status: res.status,
        latencyMs,
        ok: res.status >= 200 && res.status < 400,
      });
    } catch {
      results.push({
        path: route,
        status: 0,
        latencyMs: Math.round(performance.now() - start),
        ok: false,
      });
    }
  }
  return results;
}

function insertProposalIfNovel(params: {
  auditRunId: number;
  category: string;
  titleAr: string;
  descriptionAr: string;
  evidenceAr: string;
  priority: 'low' | 'medium' | 'high';
  proposedConfigPatch: Partial<SiteRuntimeConfig> | null;
}): void {
  const existing = db
    .prepare(
      "SELECT id FROM improvement_proposals WHERE title_ar = ? AND status IN ('pending', 'approved') LIMIT 1"
    )
    .get(params.titleAr);
  if (existing) return;

  db.prepare(`
    INSERT INTO improvement_proposals (
      audit_run_id, category, title_ar, description_ar, evidence_ar,
      priority, proposed_config_patch, status, test_passed, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?)
  `).run(
    params.auditRunId,
    params.category,
    params.titleAr,
    params.descriptionAr,
    params.evidenceAr,
    params.priority,
    params.proposedConfigPatch ? JSON.stringify(params.proposedConfigPatch) : null,
    new Date().toISOString()
  );
}

export async function runSiteAudit(params: {
  triggerType: 'scheduled' | 'manual';
  port?: number;
}): Promise<{
  auditRunId: number;
  aiStatus: 'completed' | 'skipped_no_key' | 'error';
  aiError?: string;
  issuesCount: number;
}> {
  const startedAt = new Date().toISOString();
  const port = params.port || Number(process.env.PORT || 3000);

  // 1. Live route & PWA asset probes
  const routeChecks = await checkInternalRoutes(port);
  const brokenRoutes = routeChecks.filter((r) => !r.ok);
  const slowRoutes = routeChecks.filter((r) => r.ok && r.latencyMs > 1200);

  // 2. Real telemetry aggregation (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const telemetrySummary = db
    .prepare(`
      SELECT
        COUNT(*) as totalEvents,
        SUM(CASE WHEN event_type = 'error' THEN 1 ELSE 0 END) as clientErrors,
        SUM(CASE WHEN event_type = 'broken_asset' THEN 1 ELSE 0 END) as brokenAssets,
        SUM(CASE WHEN viewport_type = 'mobile' THEN 1 ELSE 0 END) as mobileViews,
        AVG(CASE WHEN duration_ms IS NOT NULL THEN duration_ms ELSE NULL END) as avgLoadMs
      FROM telemetry_events
      WHERE created_at >= ?
    `)
    .get(sevenDaysAgo) as {
    totalEvents: number;
    clientErrors: number | null;
    brokenAssets: number | null;
    mobileViews: number | null;
    avgLoadMs: number | null;
  };

  const recentErrors = db
    .prepare(`
      SELECT route, error_message, created_at
      FROM telemetry_events
      WHERE event_type IN ('error', 'broken_asset') AND created_at >= ?
      ORDER BY id DESC
      LIMIT 10
    `)
    .all(sevenDaysAgo) as Array<{ route: string; error_message: string | null; created_at: string }>;

  // 3. Content sources & active config check
  const sources = db
    .prepare('SELECT id, name_ar, last_status, last_error, locked_by_admin FROM content_sources')
    .all() as Array<{
    id: string;
    name_ar: string;
    last_status: string;
    last_error: string | null;
    locked_by_admin: number;
  }>;

  const activeConfig = getActiveSiteConfig();
  const issues: AuditIssue[] = [];

  for (const r of brokenRoutes) {
    issues.push({
      code: `ROUTE_HTTP_${r.status}`,
      severity: 'error',
      area: 'routes',
      titleAr: `مسار أو ملف غير متاح: ${r.path}`,
      detailsAr: `أعاد الفحص رمز الحالة ${r.status || 'تعذر الاتصال'} بزمن استجابة ${r.latencyMs}ms.`,
    });
  }

  for (const r of slowRoutes) {
    issues.push({
      code: 'ROUTE_SLOW',
      severity: 'warning',
      area: 'performance',
      titleAr: `بطء في استجابة المسار: ${r.path}`,
      detailsAr: `زمن الاستجابة ${r.latencyMs}ms ويتجاوز حد 1200ms.`,
    });
  }

  for (const s of sources) {
    if (s.last_status === 'error') {
      issues.push({
        code: `SOURCE_ERR_${s.id.toUpperCase()}`,
        severity: 'warning',
        area: 'sources',
        titleAr: `ملاحظة اتصال في المصدر: ${s.name_ar}`,
        detailsAr: s.last_error || 'حدث تعذر مؤقت أثناء آخر عملية تحديث.',
      });
    }
  }

  if ((telemetrySummary.clientErrors || 0) > 0) {
    issues.push({
      code: 'CLIENT_RUNTIME_ERRORS',
      severity: 'warning',
      area: 'telemetry',
      titleAr: `تم رصد ${telemetrySummary.clientErrors} أخطاء تشغيل لدى المستخدمين`,
      detailsAr: recentErrors.map((e) => `${e.route}: ${e.error_message || 'خطأ غير محدد'}`).join(' | '),
    });
  }

  if ((telemetrySummary.brokenAssets || 0) > 0) {
    issues.push({
      code: 'BROKEN_CLIENT_ASSETS',
      severity: 'warning',
      area: 'routes',
      titleAr: `تم رصد ${telemetrySummary.brokenAssets} موارد لم تكتمل تحميلاتها`,
      detailsAr: 'يرجى مراجعة تقارير الوسائط أو الصوتيات في آخر التفاعلات.',
    });
  }

  if (!activeConfig.config.strictSecurityHeaders) {
    issues.push({
      code: 'SECURITY_HEADERS_RELAXED',
      severity: 'warning',
      area: 'security',
      titleAr: 'رؤوس الحماية الصارمة غير مفعلة بالكامل',
      detailsAr: 'يوصى بتفعيل strictSecurityHeaders لتعزيز الحماية.',
    });
  }

  const metrics = {
    routesChecked: routeChecks.length,
    brokenRoutesCount: brokenRoutes.length,
    slowRoutesCount: slowRoutes.length,
    avgRouteLatencyMs:
      routeChecks.length > 0
        ? Math.round(routeChecks.reduce((acc, r) => acc + r.latencyMs, 0) / routeChecks.length)
        : 0,
    telemetryLast7Days: {
      totalEvents: telemetrySummary.totalEvents || 0,
      clientErrors: telemetrySummary.clientErrors || 0,
      brokenAssets: telemetrySummary.brokenAssets || 0,
      mobileViews: telemetrySummary.mobileViews || 0,
      avgClientLoadMs: telemetrySummary.avgLoadMs ? Math.round(telemetrySummary.avgLoadMs) : null,
    },
    activeVersion: activeConfig.versionTag,
    routesSample: routeChecks,
  };

  // 4. Optional Server-Side Gemini Analysis (Strict: no Quran/Hadith generation)
  let aiStatus: 'completed' | 'skipped_no_key' | 'error' = 'skipped_no_key';
  let aiError: string | undefined;
  let aiSummaryAr = '';
  const aiProposals: Array<{
    category: 'ux' | 'performance' | 'security' | 'new_feature' | 'islamic_section';
    titleAr: string;
    descriptionAr: string;
    evidenceAr: string;
    priority: 'low' | 'medium' | 'high';
    configToggleKey?: keyof SiteRuntimeConfig;
  }> = [];

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const promptContext = JSON.stringify({
        platform: 'SAKINAH | سَكِينَة',
        existingSections: ['القرآن الكريم', 'استمع للقرآن', 'الأذكار والأدعية والمسبحة', 'السنة النبوية', 'مواقيت الصلاة والقبلة'],
        activeConfig: activeConfig.config,
        metrics,
        issues,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `حلل مؤشرات فحص منصة سَكِينَة الإسلامية التالية واقترح تحسينات عملية حقيقية: ${promptContext}`,
        config: {
          systemInstruction:
            'أنت مهندس تجربة مستخدم وجودة أنظمة لموقع سَكِينَة الإسلامي. حلل البيانات الفعلية المرسلة واقترح تحسينات في الأداء أو تجربة الموبايل أو الأمان أو أقسام إسلامية مساعدة جديدة (مثل متابعة الختمة، تنبيهات السنن الأسبوعية، وضع القراءة الليلي الهادئ). ممنوع تمامًا تأليف أو توليد أي آيات قرآنية أو أحاديث نبوية، وممنوع اقتراح تغيير مصادر المحتوى الديني المعتمدة. التزم بالعربية الفصحى الواضحة.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summaryAr: {
                type: Type.STRING,
                description: 'ملخص عربي موجز لحالة المنصة بناءً على نتائج الفحص.',
              },
              proposals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: {
                      type: Type.STRING,
                      description: 'أحد التصنيفات: ux, performance, security, new_feature, islamic_section',
                    },
                    titleAr: { type: Type.STRING },
                    descriptionAr: { type: Type.STRING },
                    evidenceAr: { type: Type.STRING },
                    priority: {
                      type: Type.STRING,
                      description: 'low أو medium أو high',
                    },
                    configToggleKey: {
                      type: Type.STRING,
                      description:
                        'اختياري: اسم مفتاح تهيئة مدعوم إن أمكن تطبيقه فورًا: calmNightReadingHint | weeklySunnahBanner | khatmahReminderCard',
                    },
                  },
                  required: ['category', 'titleAr', 'descriptionAr', 'evidenceAr', 'priority'],
                },
              },
            },
            required: ['summaryAr', 'proposals'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim()) as {
        summaryAr?: string;
        proposals?: typeof aiProposals;
      };
      if (parsed.summaryAr) aiSummaryAr = parsed.summaryAr;
      if (Array.isArray(parsed.proposals)) {
        aiProposals.push(...parsed.proposals.slice(0, 4));
      }
      aiStatus = 'completed';
    } catch (err) {
      aiStatus = 'error';
      aiError = err instanceof Error ? err.message : 'فشل الاتصال بخدمة Gemini API';
      await recordSystemAlert({
        severity: 'warning',
        serviceName: 'محرك التحليل الذكي للموقع',
        messageAr: 'تعذر إكمال التحليل بالذكاء الاصطناعي؛ تم حفظ الفحص الفني والقياسات الفعلية بنجاح.',
        details: aiError,
      });
    }
  }

  const finishedAt = new Date().toISOString();
  const deterministicSummary = `فحص ${routeChecks.length} مسارات (${brokenRoutes.length} أعطال، ${slowRoutes.length} بطيئة) · أحداث القياس آخر 7 أيام: ${telemetrySummary.totalEvents || 0}.`;
  const finalSummary = aiSummaryAr ? `${aiSummaryAr} — (${deterministicSummary})` : deterministicSummary;

  const insertRun = db
    .prepare(`
      INSERT INTO audit_runs (
        trigger_type, status, ai_status, ai_error, summary_ar, metrics_json, issues_json, started_at, finished_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      params.triggerType,
      brokenRoutes.length > 0 ? 'attention_needed' : 'healthy',
      aiStatus,
      aiError || null,
      finalSummary,
      JSON.stringify(metrics),
      JSON.stringify(issues),
      startedAt,
      finishedAt
    );

  const auditRunId = Number(insertRun.lastInsertRowid);

  // Store AI proposals (only when AI succeeded)
  for (const prop of aiProposals) {
    const validToggle =
      prop.configToggleKey === 'calmNightReadingHint' ||
      prop.configToggleKey === 'weeklySunnahBanner' ||
      prop.configToggleKey === 'khatmahReminderCard'
        ? { [prop.configToggleKey]: true }
        : null;

    insertProposalIfNovel({
      auditRunId,
      category: prop.category || 'ux',
      titleAr: prop.titleAr,
      descriptionAr: prop.descriptionAr,
      evidenceAr: prop.evidenceAr,
      priority: prop.priority === 'high' || prop.priority === 'low' ? prop.priority : 'medium',
      proposedConfigPatch: validToggle,
    });
  }

  // Deterministic, actionable platform proposals grounded in real config/telemetry state
  if (!activeConfig.config.khatmahReminderCard) {
    insertProposalIfNovel({
      auditRunId,
      category: 'islamic_section',
      titleAr: 'تفعيل بطاقة متابعة الختمة اليومية في الصفحة الرئيسية',
      descriptionAr: 'إضافة بطاقة هادئة تساعد الزائر على متابعة ورده القرآني اليومي وربطها مباشرة بآخر سورة قرأها.',
      evidenceAr: 'رصد فحص الواجهة عدم تفعيل khatmahReminderCard في الإصدار الحالي.',
      priority: 'medium',
      proposedConfigPatch: { khatmahReminderCard: true },
    });
  }

  if (!activeConfig.config.weeklySunnahBanner) {
    insertProposalIfNovel({
      auditRunId,
      category: 'new_feature',
      titleAr: 'تفعيل شريط السنن والآداب الأسبوعية (تذكير يوم الجمعة والإثنين والخميس)',
      descriptionAr: 'إبراز تذكير لطيف بالسنن المشروعة في أيامها الفاضلة دون إزعاج بصري.',
      evidenceAr: 'اقتراح دوري لتعزيز الارتباط العملي بالسنة النبوية ضمن إعدادات الإصدار القابل للتجربة.',
      priority: 'low',
      proposedConfigPatch: { weeklySunnahBanner: true },
    });
  }

  if (brokenRoutes.length > 0) {
    await recordSystemAlert({
      severity: 'error',
      serviceName: 'فحص صحة الموقع الدوري',
      messageAr: `اكتشف الفحص ${brokenRoutes.length} مسارًا غير مستجيب في المنصة.`,
      details: brokenRoutes.map((r) => `${r.path} -> ${r.status}`).join(', '),
    });
  }

  return {
    auditRunId,
    aiStatus,
    aiError,
    issuesCount: issues.length,
  };
}
