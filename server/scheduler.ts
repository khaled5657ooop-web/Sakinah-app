import cron from 'node-cron';
import { db } from './db.ts';
import {
  getTodayDateKey,
  refreshPrayerAndHijriSnapshot,
  refreshRecitersSync,
  runAllContentRefreshes,
} from './services/contentUpdater.ts';
import { runSiteAudit } from './services/siteAuditor.ts';
import { recordSystemAlert } from './services/alerts.ts';

let schedulerStarted = false;

export async function runScheduledCycle(params: {
  trigger: 'cron' | 'startup' | 'manual';
  port: number;
  forceContent?: boolean;
}) {
  const contentResult = await runAllContentRefreshes(Boolean(params.forceContent));
  const auditResult = await runSiteAudit({
    triggerType: params.trigger === 'manual' ? 'manual' : 'scheduled',
    port: params.port,
  });

  return {
    executedAt: new Date().toISOString(),
    trigger: params.trigger,
    contentResult,
    auditResult,
  };
}

export function startBackgroundScheduler(port: number): void {
  if (schedulerStarted) return;
  schedulerStarted = true;

  // Daily full content refresh at 01:00 AM server time
  cron.schedule('0 1 * * *', () => {
    runAllContentRefreshes(true).catch(async (err) => {
      await recordSystemAlert({
        severity: 'error',
        serviceName: 'المجدول اليومي للمحتوى',
        messageAr: 'فشل تشغيل مهمة التحديث اليومي المجدولة.',
        details: err instanceof Error ? err.message : String(err),
      });
    });
  });

  // Reciters & Prayer API health check every 6 hours
  cron.schedule('0 */6 * * *', () => {
    Promise.all([refreshPrayerAndHijriSnapshot(), refreshRecitersSync()]).catch(async (err) => {
      await recordSystemAlert({
        severity: 'warning',
        serviceName: 'فحص التلاوات والمواقيت الدوري',
        messageAr: 'تعذر إكمال الفحص الدوري لمصادر المواقيت والتلاوات.',
        details: err instanceof Error ? err.message : String(err),
      });
    });
  });

  // Daily automated site audit & improvement suggestions at 03:00 AM server time
  cron.schedule('0 3 * * *', () => {
    runSiteAudit({ triggerType: 'scheduled', port }).catch(async (err) => {
      await recordSystemAlert({
        severity: 'error',
        serviceName: 'الفحص الذكي المجدول للموقع',
        messageAr: 'فشل إكمال الفحص المجدول للمنصة.',
        details: err instanceof Error ? err.message : String(err),
      });
    });
  });

  // Gentle startup hydration if today's content or initial audit is missing
  setTimeout(async () => {
    try {
      const todayKey = getTodayDateKey();
      const hasTodayAyah = db
        .prepare("SELECT id FROM daily_content WHERE content_type = 'ayah' AND date_key = ?")
        .get(todayKey);
      const hasTodayHadith = db
        .prepare("SELECT id FROM daily_content WHERE content_type = 'hadith' AND date_key = ?")
        .get(todayKey);

      if (!hasTodayAyah || !hasTodayHadith) {
        await runAllContentRefreshes(false);
      }

      const auditCount = db.prepare('SELECT COUNT(*) as cnt FROM audit_runs').get() as { cnt: number };
      if (auditCount.cnt === 0) {
        await runSiteAudit({ triggerType: 'scheduled', port });
      }
    } catch {
      // Do not crash server startup on transient offline network conditions
    }
  }, 3500);
}
