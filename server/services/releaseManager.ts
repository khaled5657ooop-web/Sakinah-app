import { exec } from 'node:child_process';
import fs from 'node:fs';
import { promisify } from 'node:util';
import { db, DEFAULT_SITE_CONFIG, getActiveSiteConfig, type SiteRuntimeConfig } from '../db.ts';
import { recordSystemAlert } from './alerts.ts';

const execAsync = promisify(exec);

export interface SandboxCheckStep {
  id: string;
  labelAr: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

export interface SandboxTestReport {
  proposalId: number;
  ranAt: string;
  allPassed: boolean;
  steps: SandboxCheckStep[];
}

export async function runProposalSandboxTest(
  proposalId: number,
  port = Number(process.env.PORT || 3000)
): Promise<SandboxTestReport> {
  const proposal = db
    .prepare('SELECT * FROM improvement_proposals WHERE id = ?')
    .get(proposalId) as
    | {
        id: number;
        title_ar: string;
        status: string;
        proposed_config_patch: string | null;
      }
    | undefined;

  if (!proposal) {
    throw new Error('المقترح المطلوب غير موجود.');
  }
  if (proposal.status === 'rejected') {
    throw new Error('لا يمكن اختبار مقترح مرفوض.');
  }

  const steps: SandboxCheckStep[] = [];

  // Step 1: TypeScript static validation
  {
    const start = performance.now();
    try {
      await execAsync('npx tsc --noEmit', { cwd: process.cwd(), timeout: 60000 });
      steps.push({
        id: 'typescript_check',
        labelAr: 'فحص سلامة الأنواع البرمجية (TypeScript)',
        passed: true,
        durationMs: Math.round(performance.now() - start),
        details: 'نجح التحقق دون أخطاء في الشيفرة.',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل التحقق';
      steps.push({
        id: 'typescript_check',
        labelAr: 'فحص سلامة الأنواع البرمجية (TypeScript)',
        passed: false,
        durationMs: Math.round(performance.now() - start),
        details: msg.slice(0, 400),
      });
    }
  }

  // Step 2: Isolated staging bundle build (writes to /tmp/sakinah-sandbox-dist so live dist is untouched)
  const sandboxOutDir = `/tmp/sakinah-sandbox-dist-${proposalId}`;
  {
    const start = performance.now();
    try {
      await execAsync(`npx vite build --outDir ${sandboxOutDir} --emptyOutDir`, {
        cwd: process.cwd(),
        timeout: 90000,
      });
      steps.push({
        id: 'isolated_build',
        labelAr: 'بناء نسخة التجربة المعزولة (Staging Build)',
        passed: true,
        durationMs: Math.round(performance.now() - start),
        details: 'تم بناء حزمة الإنتاج المعزولة بنجاح دون التأثير على النسخة المنشورة.',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل البناء المعزول';
      steps.push({
        id: 'isolated_build',
        labelAr: 'بناء نسخة التجربة المعزولة (Staging Build)',
        passed: false,
        durationMs: Math.round(performance.now() - start),
        details: msg.slice(0, 400),
      });
    } finally {
      try {
        fs.rmSync(sandboxOutDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup
      }
    }
  }

  // Step 3: Live endpoint & config schema integrity check
  {
    const start = performance.now();
    try {
      const checks = await Promise.all([
        fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(4000) }),
        fetch(`http://127.0.0.1:${port}/api/content/daily`, { signal: AbortSignal.timeout(4000) }),
        fetch(`http://127.0.0.1:${port}/api/site/config`, { signal: AbortSignal.timeout(4000) }),
      ]);
      const allOk = checks.every((r) => r.ok);
      if (proposal.proposed_config_patch) {
        const patch = JSON.parse(proposal.proposed_config_patch) as Record<string, unknown>;
        const allowedKeys = new Set(Object.keys(DEFAULT_SITE_CONFIG));
        for (const k of Object.keys(patch)) {
          if (!allowedKeys.has(k)) {
            throw new Error(`مفتاح تهيئة غير مصرح به: ${k}`);
          }
        }
      }
      steps.push({
        id: 'endpoints_and_patch',
        labelAr: 'اختبار نقاط النهاية وتكوين التحديث',
        passed: allOk,
        durationMs: Math.round(performance.now() - start),
        details: allOk
          ? 'استجابت كافة نقاط API والتحقق من بنية التهيئة بنجاح.'
          : 'فشل أحد مسارات API أثناء الاختبار.',
      });
    } catch (err) {
      steps.push({
        id: 'endpoints_and_patch',
        labelAr: 'اختبار نقاط النهاية وتكوين التحديث',
        passed: false,
        durationMs: Math.round(performance.now() - start),
        details: err instanceof Error ? err.message : 'فشل التحقق من نقاط النهاية',
      });
    }
  }

  // Step 4: Religious source lock & verification check
  {
    const start = performance.now();
    const sources = db
      .prepare('SELECT id, locked_by_admin, endpoint_url FROM content_sources')
      .all() as Array<{ id: string; locked_by_admin: number; endpoint_url: string }>;
    const allLocked = sources.length >= 5 && sources.every((s) => s.locked_by_admin === 1);
    steps.push({
      id: 'religious_integrity',
      labelAr: 'التحقق من سلامة المصادر الدينية ومنع تعديل النصوص',
      passed: allLocked,
      durationMs: Math.round(performance.now() - start),
      details: allLocked
        ? 'كافة مصادر القرآن والسنة والأذكار محمية ومقفلة إداريًا دون أي تعديل.'
        : 'تنبيه: يوجد مصدر غير محمي بقفل الإدارة.',
    });
  }

  const allPassed = steps.every((s) => s.passed);
  const report: SandboxTestReport = {
    proposalId,
    ranAt: new Date().toISOString(),
    allPassed,
    steps,
  };

  db.prepare(`
    UPDATE improvement_proposals
    SET test_passed = ?, test_report_json = ?
    WHERE id = ?
  `).run(allPassed ? 1 : 0, JSON.stringify(report), proposalId);

  return report;
}

export async function publishApprovedProposal(proposalId: number): Promise<{
  versionTag: string;
  config: SiteRuntimeConfig;
}> {
  const proposal = db
    .prepare('SELECT * FROM improvement_proposals WHERE id = ?')
    .get(proposalId) as
    | {
        id: number;
        title_ar: string;
        status: string;
        test_passed: number;
        proposed_config_patch: string | null;
      }
    | undefined;

  if (!proposal) {
    throw new Error('المقترح غير موجود.');
  }
  if (proposal.status !== 'approved') {
    throw new Error('يجب اعتماد المقترح من قِبل الإدارة أولًا قبل نشره.');
  }
  if (proposal.test_passed !== 1) {
    throw new Error('يجب اجتياز اختبارات بيئة التجربة المعزولة قبل السماح بالنشر.');
  }

  const active = getActiveSiteConfig();
  let patch: Partial<SiteRuntimeConfig> = {};
  if (proposal.proposed_config_patch) {
    patch = JSON.parse(proposal.proposed_config_patch) as Partial<SiteRuntimeConfig>;
  }

  const nextConfig: SiteRuntimeConfig = {
    ...active.config,
    ...patch,
  };

  const countRow = db.prepare('SELECT COUNT(*) as cnt FROM releases').get() as { cnt: number };
  const versionTag = `v1.0.${countRow.cnt}`;
  const now = new Date().toISOString();

  db.exec('BEGIN');
  try {
    db.prepare('UPDATE releases SET is_active = 0 WHERE is_active = 1').run();
    db.prepare(`
      INSERT INTO releases (version_tag, summary_ar, proposal_id, config_json, is_active, created_by, created_at)
      VALUES (?, ?, ?, ?, 1, 'admin', ?)
    `).run(versionTag, proposal.title_ar, proposalId, JSON.stringify(nextConfig), now);

    db.prepare(`
      UPDATE improvement_proposals
      SET status = 'published', published_at = ?
      WHERE id = ?
    `).run(now, proposalId);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  await recordSystemAlert({
    severity: 'info',
    serviceName: 'إدارة الإصدارات والتحديثات',
    messageAr: `تم نشر الإصدار ${versionTag}: ${proposal.title_ar}`,
  });

  return { versionTag, config: nextConfig };
}

export async function rollbackToRelease(releaseId: number): Promise<{
  versionTag: string;
  config: SiteRuntimeConfig;
}> {
  const target = db
    .prepare('SELECT * FROM releases WHERE id = ?')
    .get(releaseId) as
    | {
        id: number;
        version_tag: string;
        summary_ar: string;
        config_json: string;
      }
    | undefined;

  if (!target) {
    throw new Error('الإصدار المطلوب غير موجود.');
  }

  db.exec('BEGIN');
  try {
    db.prepare('UPDATE releases SET is_active = 0 WHERE is_active = 1').run();
    db.prepare('UPDATE releases SET is_active = 1 WHERE id = ?').run(releaseId);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  await recordSystemAlert({
    severity: 'info',
    serviceName: 'استعادة الإصدارات (Rollback)',
    messageAr: `تمت استعادة الإصدار ${target.version_tag} (${target.summary_ar}) بنجاح.`,
  });

  return {
    versionTag: target.version_tag,
    config: { ...DEFAULT_SITE_CONFIG, ...(JSON.parse(target.config_json) as Partial<SiteRuntimeConfig>) },
  };
}
