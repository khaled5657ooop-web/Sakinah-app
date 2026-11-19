import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Check,
  X,
  FlaskConical,
  Rocket,
  RotateCcw,
  Lock,
  AlertTriangle,
  Activity,
  LogOut,
  Cpu,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatArabicUpdateTimestamp } from '../../services/platformApi';

interface AdminDashboardPageProps {
  onBackToHome: () => void;
  onSiteConfigUpdated?: () => void;
}

interface SessionState {
  authenticated: boolean;
  passwordConfigured: boolean;
  authMode: 'env' | 'database' | 'unconfigured';
}

interface ContentSourceRow {
  id: string;
  name_ar: string;
  category: string;
  endpoint_url: string;
  description_ar: string;
  enabled: number;
  locked_by_admin: number;
  last_checked_at: string | null;
  last_status: string;
  last_error: string | null;
}

interface DailySnapshotRow {
  content_type: string;
  date_key: string;
  item_key: string;
  source_id: string;
  fetched_at: string;
  is_verified: number;
}

interface AuditRunRow {
  id: number;
  trigger_type: string;
  status: string;
  ai_status: 'completed' | 'skipped_no_key' | 'error';
  ai_error: string | null;
  summary_ar: string;
  started_at: string;
  finished_at: string;
  metrics: {
    routesChecked?: number;
    brokenRoutesCount?: number;
    slowRoutesCount?: number;
    avgRouteLatencyMs?: number;
    telemetryLast7Days?: {
      totalEvents: number;
      clientErrors: number;
      brokenAssets: number;
      mobileViews: number;
      avgClientLoadMs: number | null;
    };
    routesSample?: Array<{
      path: string;
      status: number;
      latencyMs: number;
      ok: boolean;
    }>;
  };
  issues: Array<{
    code: string;
    severity: 'info' | 'warning' | 'error';
    area: string;
    titleAr: string;
    detailsAr: string;
  }>;
}

interface SandboxStep {
  id: string;
  labelAr: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

interface ProposalRow {
  id: number;
  category: string;
  title_ar: string;
  description_ar: string;
  evidence_ar: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'published';
  test_passed: number;
  proposedConfigPatch: Record<string, unknown> | null;
  testReport: {
    ranAt: string;
    allPassed: boolean;
    steps: SandboxStep[];
  } | null;
  created_at: string;
  published_at: string | null;
}

interface ReleaseRow {
  id: number;
  version_tag: string;
  summary_ar: string;
  is_active: number;
  created_by: string;
  created_at: string;
}

interface SystemAlertRow {
  id: number;
  severity: 'info' | 'warning' | 'error';
  service_name: string;
  message_ar: string;
  details: string | null;
  acknowledged: number;
  webhook_sent: number;
  created_at: string;
}

interface AdminOverviewData {
  activeSite: {
    versionTag: string;
    activatedAt: string;
    config: Record<string, unknown>;
  };
  geminiConfigured: boolean;
  cronSecretConfigured: boolean;
  webhookConfigured: boolean;
  sources: ContentSourceRow[];
  dailySnapshots: DailySnapshotRow[];
  recentAudits: AuditRunRow[];
  proposals: ProposalRow[];
  releases: ReleaseRow[];
  alerts: SystemAlertRow[];
  telemetryStats: {
    totalEvents: number;
    errorCount: number | null;
    mobileEvents: number | null;
    avgDurationMs: number | null;
  };
}

const CONTENT_LABELS: Record<string, string> = {
  ayah: 'آية اليوم القرآنية',
  hadith: 'الحديث النبوي اليومي',
  adhkar: 'الذكر اليومي المتنوع',
  dua: 'الدعاء اليومي المأثور',
  prayer_snapshot: 'مرصد المواقيت والتاريخ الهجري',
  reciters_sync: 'مزامنة القراء والتلاوات',
};

const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'معتمد للاختبار',
  rejected: 'مرفوض',
  published: 'منشور فعليًا',
};

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onBackToHome,
  onSiteConfigUpdated,
}) => {
  const [session, setSession] = useState<SessionState | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [actionBusyKey, setActionBusyKey] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [proposalFilter, setProposalFilter] = useState<'all' | 'pending' | 'approved' | 'published' | 'rejected'>('all');
  const [expandedTestId, setExpandedTestId] = useState<number | null>(null);

  const loadSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/session');
      const data = (await res.json()) as SessionState;
      setSession(data);
    } catch {
      setSession({ authenticated: false, passwordConfigured: true, authMode: 'database' });
    }
  }, []);

  const loadOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const res = await fetch('/api/admin/overview');
      if (res.status === 401) {
        setSession((prev) => (prev ? { ...prev, authenticated: false } : null));
        return;
      }
      if (!res.ok) throw new Error('تعذر تحميل بيانات لوحة التحكم.');
      const data = (await res.json()) as AdminOverviewData;
      setOverview(data);
    } catch (err) {
      setFeedbackMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'تعذر الاتصال بالخادم.',
      });
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (session?.authenticated) {
      void loadOverview();
    }
  }, [session?.authenticated, loadOverview]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!session) return;

    if (!session.passwordConfigured && passwordInput !== confirmPasswordInput) {
      setAuthError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const endpoint = session.passwordConfigured ? '/api/admin/login' : '/api/admin/setup';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const json = (await res.json()) as { error?: string; authenticated?: boolean };
      if (!res.ok) {
        setAuthError(json.error || 'تعذر التحقق من كلمة المرور.');
        return;
      }
      setPasswordInput('');
      setConfirmPasswordInput('');
      await loadSession();
    } catch {
      setAuthError('حدث خطأ في الاتصال بالخادم.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setOverview(null);
    await loadSession();
  };

  const runAdminAction = async (
    busyKey: string,
    url: string,
    successText: string,
    body?: Record<string, unknown>,
    notifySiteConfig = false
  ) => {
    setActionBusyKey(busyKey);
    setFeedbackMsg(null);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFeedbackMsg({ type: 'err', text: json.error || 'تعذر تنفيذ العملية.' });
        return;
      }
      setFeedbackMsg({ type: 'ok', text: successText });
      await loadOverview();
      if (notifySiteConfig && onSiteConfigUpdated) {
        onSiteConfigUpdated();
      }
    } catch {
      setFeedbackMsg({ type: 'err', text: 'فشل الاتصال بالخادم أثناء تنفيذ الإجراء.' });
    } finally {
      setActionBusyKey(null);
    }
  };

  // Loading auth session state
  if (!session) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-sm font-['Amiri',serif] text-[#064e3b] dark:text-[#dfbd69]">
          جارٍ التحقق من الجلسة الإدارية...
        </div>
      </div>
    );
  }

  // Unauthenticated View (Login or First-time Setup)
  if (!session.authenticated) {
    const isSetup = !session.passwordConfigured;
    return (
      <section className="max-w-lg mx-auto px-4 py-16">
        <div className="rounded-xl bg-white dark:bg-[#032018] border border-[#c5a059]/30 p-8 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-[#c5a059]/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#064e3b]/10 dark:bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center text-[#064e3b] dark:text-[#dfbd69]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
                  {isSetup ? 'إعداد كلمة مرور الإدارة' : 'بوابة التطوير والإدارة'}
                </h1>
                <p className="text-xs text-[#424d47] dark:text-[#c7beaf] font-['Amiri',serif]">
                  {isSetup
                    ? 'تهيئة أولية آمنة لحماية لوحة التحكم والموافقة على التحديثات.'
                    : 'وصول محمي لإدارة التحديثات التلقائية، الفحص الذكي، والإصدارات.'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#03241b] dark:text-[#f5efe6] mb-1.5 font-['Amiri',serif]">
                {isSetup ? 'تعيين كلمة المرور الإدارية (8 أحرف فأكثر)' : 'كلمة المرور الإدارية'}
              </label>
              <input
                type="password"
                required
                minLength={isSetup ? 8 : 1}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-[#fbf9f5] dark:bg-[#021812] border border-[#c5a059]/30 text-[#03241b] dark:text-[#fbf9f5] focus:outline-none focus:border-[#c5a059] font-mono text-sm"
                dir="ltr"
              />
            </div>

            {isSetup && (
              <div>
                <label className="block text-sm font-bold text-[#03241b] dark:text-[#f5efe6] mb-1.5 font-['Amiri',serif]">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#fbf9f5] dark:bg-[#021812] border border-[#c5a059]/30 text-[#03241b] dark:text-[#fbf9f5] focus:outline-none focus:border-[#c5a059] font-mono text-sm"
                  dir="ltr"
                />
              </div>
            )}

            {authError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 font-['Amiri',serif]">
                {authError}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onBackToHome}
                className="px-4 py-2.5 rounded-lg border border-[#c5a059]/30 text-xs font-['Amiri',serif] text-[#03241b] dark:text-[#e4ded5] hover:border-[#c5a059] cursor-pointer whitespace-nowrap shrink-0"
              >
                العودة للمنصة
              </button>
              <button
                type="submit"
                disabled={authSubmitting}
                className="px-6 py-2.5 rounded-lg bg-[#064e3b] dark:bg-[#dfbd69] text-[#fbf9f5] dark:text-[#021812] text-sm font-bold font-['Amiri',serif] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {authSubmitting
                  ? 'جارٍ التحقق...'
                  : isSetup
                  ? 'حفظ كلمة المرور والدخول'
                  : 'تسجيل الدخول'}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  const latestAudit = overview?.recentAudits?.[0] || null;
  const filteredProposals = (overview?.proposals || []).filter((p) =>
    proposalFilter === 'all' ? true : p.status === proposalFilter
  );
  const unacknowledgedAlerts = (overview?.alerts || []).filter((a) => !a.acknowledged);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Primary Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#c5a059]/25">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8c6b2d] dark:text-[#c5a059] font-['Amiri',serif]">
            <button onClick={onBackToHome} className="hover:underline cursor-pointer">
              سَكِينَة
            </button>
            <span aria-hidden="true">/</span>
            <span>الإدارة</span>
            <span aria-hidden="true">/</span>
            <span>لوحة التطوير والتحديث الذاتي</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
              لوحة تحكم التطوير الذكية
            </h1>
            {overview && (
              <span className="text-xs font-mono tabular-nums text-[#424d47] dark:text-[#c7beaf]">
                الإصدار النشط: {overview.activeSite.versionTag}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() =>
              runAdminAction(
                'refresh-content',
                '/api/admin/jobs/refresh-content',
                'تم تشغيل تحديث المحتوى اليومي من المصادر المعتمدة.'
              )
            }
            disabled={actionBusyKey === 'refresh-content'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#c5a059]/35 bg-white dark:bg-[#032018] text-xs font-bold font-['Amiri',serif] text-[#064e3b] dark:text-[#dfbd69] hover:border-[#dfbd69] transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionBusyKey === 'refresh-content' ? 'animate-spin' : ''}`} />
            <span>تحديث المحتوى الآن</span>
          </button>

          <button
            onClick={() =>
              runAdminAction(
                'run-audit',
                '/api/admin/jobs/run-audit',
                'اكتمل الفحص الشامل للموقع وتحديث المقترحات.'
              )
            }
            disabled={actionBusyKey === 'run-audit'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#064e3b] dark:bg-[#dfbd69] text-xs font-bold font-['Amiri',serif] text-[#fbf9f5] dark:text-[#021812] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{actionBusyKey === 'run-audit' ? 'جارٍ الفحص...' : 'تشغيل فحص ذكي للموقع'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#c5a059]/25 text-xs font-['Amiri',serif] text-[#424d47] dark:text-[#d4ccbf] hover:text-red-500 cursor-pointer whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border text-sm font-['Amiri',serif] flex items-center justify-between gap-3 ${
            feedbackMsg.type === 'ok'
              ? 'bg-emerald-950/15 border-emerald-500/30 text-[#064e3b] dark:text-emerald-300'
              : 'bg-red-950/15 border-red-500/30 text-red-700 dark:text-red-300'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs underline cursor-pointer">
            إغلاق
          </button>
        </div>
      )}

      {loadingOverview && !overview ? (
        <div className="py-12 text-center text-sm font-['Amiri',serif] text-[#424d47] dark:text-[#c7beaf]">
          جارٍ تحميل التقارير والحالة التشغيلية...
        </div>
      ) : overview ? (
        <>
          {/* Summary KPI Grid (Single-level elevation, tabular numerals) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-[#032018] border border-[#c5a059]/25">
              <div className="text-xs text-[#8c6b2d] dark:text-[#c5a059]">آخر فحص للموقع</div>
              <div className="mt-2 text-base font-bold text-[#03241b] dark:text-[#fbf9f5] tabular-nums">
                {latestAudit ? formatArabicUpdateTimestamp(latestAudit.finished_at) : 'لم يُجرَ بعد'}
              </div>
              <div className="mt-1 text-xs text-[#424d47] dark:text-[#c7beaf]">
                {latestAudit
                  ? `التحليل الذكي: ${
                      latestAudit.ai_status === 'completed'
                        ? 'مكتمل (Gemini)'
                        : latestAudit.ai_status === 'skipped_no_key'
                        ? 'فحص حتمي (مفتاح AI غير مهيأ)'
                        : 'تعذر اتصال AI — فحص فني محفوظ'
                    }`
                  : 'بانتظار أول فحص'}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#032018] border border-[#c5a059]/25">
              <div className="text-xs text-[#8c6b2d] dark:text-[#c5a059]">المقترحات المعلقة</div>
              <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#03241b] dark:text-[#fbf9f5]">
                {overview.proposals.filter((p) => p.status === 'pending').length}
              </div>
              <div className="mt-1 text-xs text-[#424d47] dark:text-[#c7beaf]">
                لا يُنشر أي تغيير إلا بموافقتك واجتياز الاختبار
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#032018] border border-[#c5a059]/25">
              <div className="text-xs text-[#8c6b2d] dark:text-[#c5a059]">القياسات التشغيلية المسجلة</div>
              <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#03241b] dark:text-[#fbf9f5]">
                {overview.telemetryStats.totalEvents || 0}
              </div>
              <div className="mt-1 text-xs text-[#424d47] dark:text-[#c7beaf] tabular-nums">
                أخطاء العملاء: {overview.telemetryStats.errorCount || 0} · زيارات الموبايل:{' '}
                {overview.telemetryStats.mobileEvents || 0}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#032018] border border-[#c5a059]/25">
              <div className="text-xs text-[#8c6b2d] dark:text-[#c5a059]">التنبيهات غير المؤكدة</div>
              <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#03241b] dark:text-[#fbf9f5]">
                {unacknowledgedAlerts.length}
              </div>
              <div className="mt-1 text-xs text-[#424d47] dark:text-[#c7beaf]">
                {overview.webhookConfigured ? 'إشعار Webhook مفعّل' : 'تنبيهات داخلية فقط'}
              </div>
            </div>
          </div>

          {/* Section 1: Improvement Proposals + Isolated Staging Tests + Publish Gate */}
          <div className="rounded-xl bg-white dark:bg-[#032018] border border-[#c5a059]/25 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#c5a059]/15">
              <div>
                <h2 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
                  مقترحات التطوير والمزايا الجديدة
                </h2>
                <p className="text-xs text-[#424d47] dark:text-[#c7beaf] mt-0.5">
                  دورة النشر الآمنة: قبول الإدارة ← اختبار في بيئة التجربة المعزولة ← نشر للإنتاج
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#fbf9f5] dark:bg-[#021812] rounded-lg border border-[#c5a059]/20">
                {(['all', 'pending', 'approved', 'published', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setProposalFilter(st)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      proposalFilter === st
                        ? 'bg-[#064e3b] dark:bg-[#dfbd69] text-[#fbf9f5] dark:text-[#021812] font-bold'
                        : 'text-[#424d47] dark:text-[#c7beaf] hover:text-[#03241b] dark:hover:text-[#fbf9f5]'
                    }`}
                  >
                    {st === 'all' ? 'الكل' : PROPOSAL_STATUS_LABELS[st]}
                  </button>
                ))}
              </div>
            </div>

            {filteredProposals.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#424d47] dark:text-[#c7beaf]">
                لا توجد مقترحات مطابقة لهذا التصنيف حاليًا. اضغط على «تشغيل فحص ذكي للموقع» لتحليل الحالة.
              </div>
            ) : (
              <div className="divide-y divide-[#c5a059]/15">
                {filteredProposals.map((prop) => {
                  const canPublish = prop.status === 'approved' && prop.test_passed === 1;
                  const showReport = expandedTestId === prop.id || prop.testReport;

                  return (
                    <div key={prop.id} className="py-5 first:pt-0 last:pb-0 space-y-3">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-1.5 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#8c6b2d] dark:text-[#c5a059]">
                            <span>{PROPOSAL_STATUS_LABELS[prop.status]}</span>
                            <span aria-hidden="true">·</span>
                            <span>التصنيف: {prop.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>الأولوية: {prop.priority === 'high' ? 'عالية' : prop.priority === 'low' ? 'منخفضة' : 'متوسطة'}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{formatArabicUpdateTimestamp(prop.created_at)}</span>
                          </div>
                          <h3 className="text-lg font-bold text-[#03241b] dark:text-[#fbf9f5]">
                            {prop.title_ar}
                          </h3>
                          <p className="text-sm text-[#424d47] dark:text-[#d4ccbf] leading-relaxed">
                            {prop.description_ar}
                          </p>
                          <p className="text-xs text-[#6e6456] dark:text-[#a89e8f]">
                            الدليل المرصود: {prop.evidence_ar}
                          </p>
                        </div>

                        {/* Interactive Approval / Sandbox Test / Publish Controls */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {prop.status !== 'published' && prop.status !== 'approved' && (
                            <button
                              onClick={() =>
                                runAdminAction(
                                  `approve-${prop.id}`,
                                  `/api/admin/proposals/${prop.id}/approve`,
                                  'تم قبول المقترح. يمكنك الآن اختباره في بيئة التجربة.'
                                )
                              }
                              disabled={actionBusyKey === `approve-${prop.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#064e3b] text-[#fbf9f5] text-xs font-bold hover:opacity-90 cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>قبول</span>
                            </button>
                          )}

                          {prop.status !== 'published' && prop.status !== 'rejected' && (
                            <button
                              onClick={() =>
                                runAdminAction(
                                  `reject-${prop.id}`,
                                  `/api/admin/proposals/${prop.id}/reject`,
                                  'تم رفض المقترح وحفظ القرار.'
                                )
                              }
                              disabled={actionBusyKey === `reject-${prop.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/35 text-red-600 dark:text-red-300 text-xs font-bold hover:bg-red-500/10 cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>رفض</span>
                            </button>
                          )}

                          {prop.status === 'approved' && (
                            <button
                              onClick={async () => {
                                setExpandedTestId(prop.id);
                                await runAdminAction(
                                  `test-${prop.id}`,
                                  `/api/admin/proposals/${prop.id}/test`,
                                  'اكتمل اختبار بيئة التجربة المعزولة.'
                                );
                              }}
                              disabled={actionBusyKey === `test-${prop.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#c5a059]/45 text-[#8c6b2d] dark:text-[#dfbd69] text-xs font-bold hover:bg-[#c5a059]/10 cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <FlaskConical className="w-3.5 h-3.5" />
                              <span>
                                {actionBusyKey === `test-${prop.id}`
                                  ? 'جارٍ الاختبار المعزول...'
                                  : 'اختبار في بيئة التجربة'}
                              </span>
                            </button>
                          )}

                          {prop.status === 'approved' && (
                            <button
                              onClick={() =>
                                runAdminAction(
                                  `publish-${prop.id}`,
                                  `/api/admin/proposals/${prop.id}/publish`,
                                  'تم نشر التحديث بنجاح وتسجيله في سجل الإصدارات.',
                                  undefined,
                                  true
                                )
                              }
                              disabled={!canPublish || actionBusyKey === `publish-${prop.id}`}
                              title={
                                canPublish
                                  ? 'نشر هذا التحديث للمستخدمين'
                                  : 'يجب اجتياز اختبار بيئة التجربة أولًا قبل النشر'
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#dfbd69] text-[#021812] text-xs font-bold hover:bg-[#f3e5ab] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <Rocket className="w-3.5 h-3.5" />
                              <span>نشر التحديث</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Real Staging Test Report (when executed) */}
                      {showReport && prop.testReport && (
                        <div className="pt-3 text-xs space-y-2">
                          <div className="flex items-center gap-2 font-bold text-[#03241b] dark:text-[#fbf9f5]">
                            {prop.testReport.allPassed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span>
                              تقرير بيئة التجربة المعزولة ({formatArabicUpdateTimestamp(prop.testReport.ranAt)})
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs border-collapse">
                              <tbody>
                                {prop.testReport.steps.map((step) => (
                                  <tr key={step.id} className="border-t border-[#c5a059]/10">
                                    <td className="py-2 pl-3 font-medium text-[#03241b] dark:text-[#f5efe6] whitespace-nowrap">
                                      {step.labelAr}
                                    </td>
                                    <td className="py-2 pl-3 whitespace-nowrap">
                                      <span
                                        className={
                                          step.passed
                                            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                            : 'text-red-600 dark:text-red-400 font-bold'
                                        }
                                      >
                                        {step.passed ? 'نجح' : 'فشل'}
                                      </span>
                                    </td>
                                    <td className="py-2 pl-3 font-mono tabular-nums text-[#6e6456] dark:text-[#a89e8f] whitespace-nowrap">
                                      {step.durationMs}ms
                                    </td>
                                    <td className="py-2 text-[#424d47] dark:text-[#c7beaf]">
                                      {step.details}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Auto-Update Snapshots & Locked Content Sources Governance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Auto-Update Status Table */}
            <div className="rounded-xl bg-white dark:bg-[#032018] border border-[#c5a059]/25 p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
                  حالة تحديث المحتوى التلقائي
                </h2>
                <p className="text-xs text-[#424d47] dark:text-[#c7beaf] mt-0.5">
                  آخر نسخة موثوقة محفوظة مع حماية من التكرار واحتفاظ تلقائي عند انقطاع الشبكة
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-[#c5a059]/20 text-[#8c6b2d] dark:text-[#c5a059]">
                      <th className="pb-2.5 font-bold">المجال</th>
                      <th className="pb-2.5 font-bold">تاريخ النسخة</th>
                      <th className="pb-2.5 font-bold">المعرف</th>
                      <th className="pb-2.5 font-bold">آخر تحديث ناجح</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c5a059]/10">
                    {overview.dailySnapshots.map((snap) => (
                      <tr key={snap.content_type} className="hover:bg-[#c5a059]/5">
                        <td className="py-3 font-bold text-[#03241b] dark:text-[#fbf9f5]">
                          {CONTENT_LABELS[snap.content_type] || snap.content_type}
                        </td>
                        <td className="py-3 font-mono tabular-nums text-[#424d47] dark:text-[#c7beaf]">
                          {snap.date_key}
                        </td>
                        <td className="py-3 font-mono tabular-nums text-[#6e6456] dark:text-[#a89e8f]">
                          {snap.item_key}
                        </td>
                        <td className="py-3 tabular-nums text-[#424d47] dark:text-[#c7beaf]">
                          {formatArabicUpdateTimestamp(snap.fetched_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Locked Verified Sources Governance */}
            <div className="rounded-xl bg-white dark:bg-[#032018] border border-[#c5a059]/25 p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
                  حوكمة المصادر الدينية الموثوقة
                </h2>
                <p className="text-xs text-[#424d47] dark:text-[#c7beaf] mt-0.5">
                  كافة المصادر مقفلة إداريًا؛ لا يُسمح لأي مهمة تلقائية بتبديل مصدر أو تعديل نص ديني
                </p>
              </div>

              <div className="divide-y divide-[#c5a059]/15">
                {overview.sources.map((src) => (
                  <div key={src.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#064e3b] dark:text-[#dfbd69] shrink-0" />
                        <span className="text-sm font-bold text-[#03241b] dark:text-[#fbf9f5]">
                          {src.name_ar}
                        </span>
                      </div>
                      <div className="text-xs text-[#424d47] dark:text-[#c7beaf]">
                        {src.description_ar}
                      </div>
                      <div className="text-[11px] font-mono text-[#6e6456] dark:text-[#a89e8f]" dir="ltr">
                        {src.endpoint_url}
                      </div>
                      <div className="text-[11px] text-[#8c6b2d] dark:text-[#c5a059] tabular-nums">
                        الحالة: {src.last_status === 'ok' ? 'متصل وسليم' : src.last_status === 'error' ? 'تعذر مؤقت' : src.last_status === 'disabled' ? 'معطل إداريًا' : 'قيد الانتظار'}
                        {src.last_checked_at ? ` · ${formatArabicUpdateTimestamp(src.last_checked_at)}` : ''}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        runAdminAction(
                          `src-${src.id}`,
                          `/api/admin/sources/${src.id}/toggle`,
                          src.enabled ? 'تم تعطيل المصدر إداريًا.' : 'تم تفعيل المصدر المعتمد.',
                          { enabled: !src.enabled }
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                        src.enabled
                          ? 'border-emerald-500/35 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10'
                          : 'border-[#c5a059]/30 text-[#6e6456] dark:text-[#a89e8f]'
                      }`}
                    >
                      {src.enabled ? 'مفعل' : 'معطل'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Site Audit Diagnostics & Releases Rollback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Latest Site Audit Report */}
            <div className="rounded-xl bg-white dark:bg-[#032018] border border-[#c5a059]/25 p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
                    تقرير فحص الأخطاء والأداء
                  </h2>
                  <p className="text-xs text-[#424d47] dark:text-[#c7beaf] mt-0.5">
                    فحص المسارات، سرعة الاستجابة، التوافق مع الموبايل، وسجل أخطاء الزوار
                  </p>
                </div>
                <Activity className="w-5 h-5 text-[#c5a059]" />
              </div>

              {latestAudit ? (
                <div className="space-y-4">
                  <div className="text-sm text-[#03241b] dark:text-[#fbf9f5] leading-relaxed">
                    {latestAudit.summary_ar}
                  </div>

                  {latestAudit.issues.length > 0 ? (
                    <div className="space-y-2">
                      {latestAudit.issues.map((iss, idx) => (
                        <div
                          key={`${iss.code}-${idx}`}
                          className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs space-y-1"
                        >
                          <div className="font-bold text-[#03241b] dark:text-[#dfbd69]">
                            {iss.titleAr}
                          </div>
                          <div className="text-[#424d47] dark:text-[#c7beaf]">{iss.detailsAr}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 text-xs text-emerald-700 dark:text-emerald-300">
                      لم تُكتشف أعطال أو روابط معطوبة في آخر فحص للمنصة.
                    </div>
                  )}

                  {latestAudit.metrics.routesSample && (
                    <div className="overflow-x-auto max-h-56">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="border-b border-[#c5a059]/15 text-[#8c6b2d] dark:text-[#c5a059]">
                            <th className="pb-2">المسار</th>
                            <th className="pb-2">الحالة</th>
                            <th className="pb-2">الاستجابة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#c5a059]/10">
                          {latestAudit.metrics.routesSample.map((r) => (
                            <tr key={r.path}>
                              <td className="py-1.5 font-mono text-[11px]" dir="ltr">
                                {r.path}
                              </td>
                              <td className="py-1.5 font-mono tabular-nums">
                                <span className={r.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                                  HTTP {r.status}
                                </span>
                              </td>
                              <td className="py-1.5 font-mono tabular-nums text-[#424d47] dark:text-[#c7beaf]">
                                {r.latencyMs}ms
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-[#424d47] dark:text-[#c7beaf]">
                  لم يتم تنفيذ أي فحص بعد.
                </div>
              )}
            </div>

            {/* Releases & Rollback History + System Alerts */}
            <div className="space-y-6">
              <div className="rounded-xl bg-white dark:bg-[#032018] border border-[#c5a059]/25 p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
                    سجل الإصدارات والاستعادة (Rollback)
                  </h2>
                  <p className="text-xs text-[#424d47] dark:text-[#c7beaf] mt-0.5">
                    يمكنك العودة الفورية إلى أي نسخة مستقرة سابقة بضغطة زر
                  </p>
                </div>

                <div className="divide-y divide-[#c5a059]/15">
                  {overview.releases.map((rel) => (
                    <div key={rel.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-[#064e3b] dark:text-[#dfbd69]">
                            {rel.version_tag}
                          </span>
                          {rel.is_active === 1 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                الإصدار النشط حاليًا
                              </span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums text-[#6e6456] dark:text-[#a89e8f]">
                            {formatArabicUpdateTimestamp(rel.created_at)}
                          </span>
                        </div>
                        <div className="text-sm text-[#03241b] dark:text-[#fbf9f5] mt-0.5">
                          {rel.summary_ar}
                        </div>
                      </div>

                      {rel.is_active === 0 && (
                        <button
                          onClick={() =>
                            runAdminAction(
                              `rollback-${rel.id}`,
                              `/api/admin/releases/${rel.id}/rollback`,
                              `تمت استعادة الإصدار ${rel.version_tag} بنجاح.`,
                              undefined,
                              true
                            )
                          }
                          disabled={actionBusyKey === `rollback-${rel.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c5a059]/35 text-xs font-bold text-[#8c6b2d] dark:text-[#dfbd69] hover:bg-[#c5a059]/10 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>استعادة</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* System Failure & Refresh Alerts */}
              <div className="rounded-xl bg-white dark:bg-[#032018] border border-[#c5a059]/25 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
                    سجل التنبيهات عند التعذر
                  </h2>
                  <AlertTriangle className="w-4 h-4 text-[#c5a059]" />
                </div>

                {overview.alerts.length === 0 ? (
                  <p className="text-xs text-[#424d47] dark:text-[#c7beaf]">
                    لا توجد تنبيهات مسجلة حاليًا؛ كافة الخدمات تعمل باستقرار.
                  </p>
                ) : (
                  <div className="divide-y divide-[#c5a059]/15 max-h-64 overflow-y-auto">
                    {overview.alerts.map((al) => (
                      <div key={al.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2 text-[#8c6b2d] dark:text-[#c5a059]">
                            <span className="font-bold">{al.service_name}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{formatArabicUpdateTimestamp(al.created_at)}</span>
                          </div>
                          <div className="text-sm text-[#03241b] dark:text-[#fbf9f5]">
                            {al.message_ar}
                          </div>
                          {al.details && (
                            <div className="font-mono text-[11px] text-[#6e6456] dark:text-[#a89e8f]" dir="ltr">
                              {al.details}
                            </div>
                          )}
                        </div>

                        {al.acknowledged === 0 && (
                          <button
                            onClick={() =>
                              runAdminAction(
                                `ack-${al.id}`,
                                `/api/admin/alerts/${al.id}/acknowledge`,
                                'تم تأكيد قراءة التنبيه.'
                              )
                            }
                            className="px-2.5 py-1 rounded-md border border-[#c5a059]/30 text-[11px] text-[#064e3b] dark:text-[#dfbd69] cursor-pointer whitespace-nowrap shrink-0"
                          >
                            تم الاطلاع
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
};
