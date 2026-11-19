import { db } from '../db.ts';

export type AlertSeverity = 'info' | 'warning' | 'error';

export async function recordSystemAlert(params: {
  severity: AlertSeverity;
  serviceName: string;
  messageAr: string;
  details?: string;
}): Promise<void> {
  const now = new Date().toISOString();
  let webhookSent = 0;

  const webhookUrl = process.env.ALERT_WEBHOOK_URL?.trim();
  if (webhookUrl && (params.severity === 'error' || params.severity === 'warning')) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'SAKINAH | سَكِينَة',
          severity: params.severity,
          service: params.serviceName,
          message: params.messageAr,
          details: params.details || null,
          timestamp: now,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) webhookSent = 1;
    } catch {
      webhookSent = 0;
    }
  }

  db.prepare(`
    INSERT INTO system_alerts (severity, service_name, message_ar, details, acknowledged, webhook_sent, created_at)
    VALUES (?, ?, ?, ?, 0, ?, ?)
  `).run(
    params.severity,
    params.serviceName,
    params.messageAr,
    params.details || null,
    webhookSent,
    now
  );
}
