import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { db, getActiveSiteConfig, initDatabase } from './server/db.ts';
import {
  checkLoginRateLimit,
  clearAdminCookie,
  createSessionToken,
  hasAdminPasswordConfigured,
  isCronAuthorized,
  isRequestAdmin,
  requireAdmin,
  resetLoginRateLimit,
  setAdminCookie,
  setupInitialAdminPassword,
  verifyAdminPassword,
} from './server/auth.ts';
import {
  getPublicDailyBundle,
  runAllContentRefreshes,
} from './server/services/contentUpdater.ts';
import { runSiteAudit } from './server/services/siteAuditor.ts';
import {
  publishApprovedProposal,
  rollbackToRelease,
  runProposalSandboxTest,
} from './server/services/releaseManager.ts';
import { runScheduledCycle, startBackgroundScheduler } from './server/scheduler.ts';

async function startServer() {
  initDatabase();

  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '256kb' }));

  // Baseline security headers honoring active release policy
  app.use((_req, res, next) => {
    const { config } = getActiveSiteConfig();
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (config.strictSecurityHeaders) {
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    }
    next();
  });

  // ---------------- Public Platform Endpoints ----------------

  app.get('/api/health', (_req, res) => {
    const active = getActiveSiteConfig();
    res.json({
      status: 'ok',
      platform: 'SAKINAH | سَكِينَة',
      version: active.versionTag,
      serverTime: new Date().toISOString(),
    });
  });

  app.get('/api/content/daily', async (_req, res) => {
    try {
      let bundle = getPublicDailyBundle();
      if (!bundle.ayah || !bundle.hadith) {
        await runAllContentRefreshes(false);
        bundle = getPublicDailyBundle();
      }
      res.json(bundle);
    } catch (err) {
      res.status(500).json({
        error: 'تعذر قراءة المحتوى اليومي المحفوظ.',
        details: err instanceof Error ? err.message : undefined,
      });
    }
  });

  app.get('/api/site/config', (_req, res) => {
    res.json(getActiveSiteConfig());
  });

  app.post('/api/telemetry', (req, res) => {
    try {
      const body = (req.body || {}) as {
        eventType?: string;
        route?: string;
        durationMs?: number;
        viewportType?: string;
        errorMessage?: string;
        metadata?: Record<string, unknown>;
      };

      const allowedTypes = new Set(['pageview', 'performance', 'error', 'broken_asset', 'interaction']);
      const eventType = allowedTypes.has(body.eventType || '') ? body.eventType! : 'pageview';
      const route = typeof body.route === 'string' ? body.route.slice(0, 120) : '/';
      const durationMs =
        typeof body.durationMs === 'number' && Number.isFinite(body.durationMs) && body.durationMs >= 0
          ? Math.min(body.durationMs, 120000)
          : null;
      const viewportType = body.viewportType === 'mobile' ? 'mobile' : 'desktop';
      const errorMessage =
        typeof body.errorMessage === 'string' ? body.errorMessage.slice(0, 500) : null;

      db.prepare(`
        INSERT INTO telemetry_events (event_type, route, duration_ms, viewport_type, error_message, metadata_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        eventType,
        route,
        durationMs,
        viewportType,
        errorMessage,
        body.metadata ? JSON.stringify(body.metadata).slice(0, 1000) : null,
        new Date().toISOString()
      );

      res.status(202).json({ recorded: true });
    } catch {
      res.status(400).json({ error: 'بيانات القياس غير صالحة.' });
    }
  });

  // External/cloud cron webhook trigger (secured by CRON_SECRET or admin session)
  app.post('/api/cron/run', async (req, res) => {
    if (!isCronAuthorized(req)) {
      res.status(401).json({ error: 'مفتاح المهام المجدولة غير صالح أو مفقود.' });
      return;
    }
    try {
      const result = await runScheduledCycle({
        trigger: 'cron',
        port: PORT,
        forceContent: Boolean(req.body?.forceContent),
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'فشل تشغيل المهام المجدولة.',
      });
    }
  });

  // ---------------- Admin Authentication Endpoints ----------------

  app.get('/api/admin/session', (req, res) => {
    const setupState = hasAdminPasswordConfigured();
    res.json({
      authenticated: isRequestAdmin(req),
      passwordConfigured: setupState.configured,
      authMode: setupState.mode,
    });
  });

  app.post('/api/admin/setup', (req, res) => {
    try {
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      setupInitialAdminPassword(password);
      const token = createSessionToken();
      setAdminCookie(res, token);
      res.json({ ok: true, authenticated: true });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'تعذر إعداد كلمة المرور الإدارية.',
      });
    }
  });

  app.post('/api/admin/login', (req, res) => {
    const ip = req.ip || 'unknown';
    const limit = checkLoginRateLimit(ip);
    if (!limit.allowed) {
      res.status(429).json({
        error: `تم تجاوز عدد المحاولات المسموح به. يرجى المحاولة بعد ${limit.retryAfterSec} ثانية.`,
      });
      return;
    }

    const setupState = hasAdminPasswordConfigured();
    if (!setupState.configured) {
      res.status(400).json({
        error: 'لم يتم تعيين كلمة مرور الإدارة بعد. يرجى إعداد كلمة المرور أولًا.',
      });
      return;
    }

    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!verifyAdminPassword(password)) {
      res.status(401).json({ error: 'كلمة المرور الإدارية غير صحيحة.' });
      return;
    }

    resetLoginRateLimit(ip);
    const token = createSessionToken();
    setAdminCookie(res, token);
    res.json({ ok: true, authenticated: true });
  });

  app.post('/api/admin/logout', (_req, res) => {
    clearAdminCookie(res);
    res.json({ ok: true });
  });

  // ---------------- Protected Admin Development Dashboard Endpoints ----------------

  app.get('/api/admin/overview', requireAdmin, (_req, res) => {
    const sources = db
      .prepare('SELECT * FROM content_sources ORDER BY id ASC')
      .all();

    const dailySnapshots = db
      .prepare(`
        SELECT content_type, date_key, item_key, source_id, fetched_at, is_verified
        FROM daily_content
        WHERE id IN (
          SELECT MAX(id) FROM daily_content GROUP BY content_type
        )
        ORDER BY content_type ASC
      `)
      .all();

    const recentAudits = db
      .prepare('SELECT * FROM audit_runs ORDER BY id DESC LIMIT 10')
      .all()
      .map((row: Record<string, unknown>) => ({
        ...row,
        metrics: JSON.parse(String(row.metrics_json || '{}')),
        issues: JSON.parse(String(row.issues_json || '[]')),
      }));

    const proposals = db
      .prepare('SELECT * FROM improvement_proposals ORDER BY id DESC LIMIT 30')
      .all()
      .map((row: Record<string, unknown>) => ({
        ...row,
        proposedConfigPatch: row.proposed_config_patch
          ? JSON.parse(String(row.proposed_config_patch))
          : null,
        testReport: row.test_report_json
          ? JSON.parse(String(row.test_report_json))
          : null,
      }));

    const releases = db
      .prepare('SELECT * FROM releases ORDER BY id DESC LIMIT 15')
      .all()
      .map((row: Record<string, unknown>) => ({
        ...row,
        config: JSON.parse(String(row.config_json || '{}')),
      }));

    const alerts = db
      .prepare('SELECT * FROM system_alerts ORDER BY id DESC LIMIT 25')
      .all();

    const telemetryStats = db
      .prepare(`
        SELECT
          COUNT(*) as totalEvents,
          SUM(CASE WHEN event_type = 'error' THEN 1 ELSE 0 END) as errorCount,
          SUM(CASE WHEN viewport_type = 'mobile' THEN 1 ELSE 0 END) as mobileEvents,
          AVG(CASE WHEN duration_ms IS NOT NULL THEN duration_ms ELSE NULL END) as avgDurationMs
        FROM telemetry_events
      `)
      .get();

    res.json({
      activeSite: getActiveSiteConfig(),
      geminiConfigured: Boolean(
        process.env.GEMINI_API_KEY?.trim() && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
      ),
      cronSecretConfigured: Boolean(process.env.CRON_SECRET?.trim()),
      webhookConfigured: Boolean(process.env.ALERT_WEBHOOK_URL?.trim()),
      sources,
      dailySnapshots,
      recentAudits,
      proposals,
      releases,
      alerts,
      telemetryStats,
    });
  });

  app.post('/api/admin/jobs/refresh-content', requireAdmin, async (_req, res) => {
    try {
      const result = await runAllContentRefreshes(true);
      res.json({ ok: true, result });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'فشل تحديث المحتوى.',
      });
    }
  });

  app.post('/api/admin/jobs/run-audit', requireAdmin, async (_req, res) => {
    try {
      const result = await runSiteAudit({ triggerType: 'manual', port: PORT });
      res.json({ ok: true, result });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'فشل فحص الموقع.',
      });
    }
  });

  app.post('/api/admin/proposals/:id/approve', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const info = db
      .prepare(`
        UPDATE improvement_proposals
        SET status = 'approved', reviewed_at = ?
        WHERE id = ? AND status IN ('pending', 'rejected')
      `)
      .run(new Date().toISOString(), id);

    if (info.changes === 0) {
      res.status(404).json({ error: 'المقترح غير موجود أو تم نشره مسبقًا.' });
      return;
    }
    res.json({ ok: true });
  });

  app.post('/api/admin/proposals/:id/reject', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const info = db
      .prepare(`
        UPDATE improvement_proposals
        SET status = 'rejected', reviewed_at = ?
        WHERE id = ? AND status != 'published'
      `)
      .run(new Date().toISOString(), id);

    if (info.changes === 0) {
      res.status(404).json({ error: 'المقترح غير موجود أو منشور بالفعل.' });
      return;
    }
    res.json({ ok: true });
  });

  app.post('/api/admin/proposals/:id/test', requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const report = await runProposalSandboxTest(id, PORT);
      res.json({ ok: true, report });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'فشل تنفيذ اختبارات بيئة التجربة.',
      });
    }
  });

  app.post('/api/admin/proposals/:id/publish', requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const released = await publishApprovedProposal(id);
      res.json({ ok: true, released });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'تعذر نشر التحديث.',
      });
    }
  });

  app.post('/api/admin/releases/:id/rollback', requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const restored = await rollbackToRelease(id);
      res.json({ ok: true, restored });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'تعذر استعادة الإصدار السابق.',
      });
    }
  });

  app.post('/api/admin/alerts/:id/acknowledge', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    db.prepare('UPDATE system_alerts SET acknowledged = 1 WHERE id = ?').run(id);
    res.json({ ok: true });
  });

  app.post('/api/admin/sources/:id/toggle', requireAdmin, (req, res) => {
    const id = String(req.params.id);
    const enabled = req.body?.enabled ? 1 : 0;
    const info = db
      .prepare('UPDATE content_sources SET enabled = ? WHERE id = ?')
      .run(enabled, id);
    if (info.changes === 0) {
      res.status(404).json({ error: 'المصدر غير موجود.' });
      return;
    }
    res.json({ ok: true, enabled: Boolean(enabled) });
  });

  // ---------------- Frontend Serving (Vite Dev Middleware or Prod Static) ----------------

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SAKINAH intelligent platform listening on http://0.0.0.0:${PORT}`);
    startBackgroundScheduler(PORT);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SAKINAH server:', err);
  process.exit(1);
});
