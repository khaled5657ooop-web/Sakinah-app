import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'sakinah.db');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for concurrent reads/writes and foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export interface SiteRuntimeConfig {
  showLastUpdatedBadge: boolean;
  calmNightReadingHint: boolean;
  weeklySunnahBanner: boolean;
  khatmahReminderCard: boolean;
  strictSecurityHeaders: boolean;
  announcementText: string | null;
}

export const DEFAULT_SITE_CONFIG: SiteRuntimeConfig = {
  showLastUpdatedBadge: true,
  calmNightReadingHint: false,
  weeklySunnahBanner: false,
  khatmahReminderCard: false,
  strictSecurityHeaders: true,
  announcementText: null,
};

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_credentials (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_sources (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      category TEXT NOT NULL,
      endpoint_url TEXT NOT NULL,
      description_ar TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      locked_by_admin INTEGER NOT NULL DEFAULT 1,
      last_checked_at TEXT,
      last_status TEXT DEFAULT 'pending',
      last_error TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_type TEXT NOT NULL,
      date_key TEXT NOT NULL,
      item_key TEXT NOT NULL,
      source_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 1,
      fetched_at TEXT NOT NULL,
      UNIQUE(content_type, date_key)
    );

    CREATE TABLE IF NOT EXISTS content_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_type TEXT NOT NULL,
      item_key TEXT NOT NULL,
      date_key TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_content_history_type_date
      ON content_history(content_type, created_at DESC);

    CREATE TABLE IF NOT EXISTS telemetry_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      route TEXT NOT NULL,
      duration_ms REAL,
      viewport_type TEXT,
      error_message TEXT,
      metadata_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_telemetry_created
      ON telemetry_events(created_at DESC);

    CREATE TABLE IF NOT EXISTS audit_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trigger_type TEXT NOT NULL,
      status TEXT NOT NULL,
      ai_status TEXT NOT NULL,
      ai_error TEXT,
      summary_ar TEXT NOT NULL,
      metrics_json TEXT NOT NULL,
      issues_json TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS improvement_proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_run_id INTEGER,
      category TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      description_ar TEXT NOT NULL,
      evidence_ar TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      proposed_config_patch TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      test_passed INTEGER NOT NULL DEFAULT 0,
      test_report_json TEXT,
      reviewed_at TEXT,
      published_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (audit_run_id) REFERENCES audit_runs(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS releases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version_tag TEXT NOT NULL UNIQUE,
      summary_ar TEXT NOT NULL,
      proposal_id INTEGER,
      config_json TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 0,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (proposal_id) REFERENCES improvement_proposals(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS system_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      severity TEXT NOT NULL,
      service_name TEXT NOT NULL,
      message_ar TEXT NOT NULL,
      details TEXT,
      acknowledged INTEGER NOT NULL DEFAULT 0,
      webhook_sent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  seedInitialSources();
  seedInitialRelease();
}

function seedInitialSources(): void {
  const sources = [
    {
      id: 'quran_api',
      name_ar: 'مصحف القرآن الكريم (Quran.com API v4)',
      category: 'quran',
      endpoint_url: 'https://api.quran.com/api/v4',
      description_ar: 'المصدر الرسمي المعتمد للنص العثماني وتفسير الآيات القرآنية.',
    },
    {
      id: 'hadith_verified',
      name_ar: 'موسوعة السنة النبوية المخرجة (SAKINAH Verified Registry)',
      category: 'hadith',
      endpoint_url: 'local://verified-hadith-registry',
      description_ar: 'أحاديث موثقة من الصحيحين والسنن مع التخريج الكامل ودرجة الحكم.',
    },
    {
      id: 'aladhan_api',
      name_ar: 'مرصد المواقيت والتقويم الهجري (AlAdhan API)',
      category: 'prayer',
      endpoint_url: 'https://api.aladhan.com/v1',
      description_ar: 'حساب مواقيت الصلاة المعتمدة والتاريخ الهجري والمناسبات الإسلامية.',
    },
    {
      id: 'mp3quran_api',
      name_ar: 'مكتبة التلاوات الكاملة (MP3Quran v3 CDN)',
      category: 'audio',
      endpoint_url: 'https://mp3quran.net/api/v3/reciters?language=ar',
      description_ar: 'بيانات القراء العشرة المعتمدين والتحقق من سلامة روابط التلاوات الكاملة.',
    },
    {
      id: 'adhkar_duas_verified',
      name_ar: 'حصن المسلم وجوامع الدعاء المأثورة',
      category: 'adhkar',
      endpoint_url: 'local://verified-adhkar-duas',
      description_ar: 'الأذكار اليومية والأدعية القرآنية والنبوية الموثقة بالمصادر.',
    },
  ];

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO content_sources (
      id, name_ar, category, endpoint_url, description_ar, enabled, locked_by_admin, last_status
    ) VALUES (?, ?, ?, ?, ?, 1, 1, 'pending')
  `);

  for (const s of sources) {
    insertStmt.run(s.id, s.name_ar, s.category, s.endpoint_url, s.description_ar);
  }
}

function seedInitialRelease(): void {
  const countRow = db.prepare('SELECT COUNT(*) as cnt FROM releases').get() as { cnt: number };
  if (countRow.cnt === 0) {
    db.prepare(`
      INSERT INTO releases (version_tag, summary_ar, proposal_id, config_json, is_active, created_by, created_at)
      VALUES (?, ?, NULL, ?, 1, 'system', ?)
    `).run(
      'v1.0.0',
      'الإصدار الأساسي المستقر لمنصة سَكِينَة الذكية',
      JSON.stringify(DEFAULT_SITE_CONFIG),
      new Date().toISOString()
    );
  }
}

export function getActiveSiteConfig(): {
  versionTag: string;
  config: SiteRuntimeConfig;
  activatedAt: string;
} {
  const row = db
    .prepare('SELECT version_tag, config_json, created_at FROM releases WHERE is_active = 1 ORDER BY id DESC LIMIT 1')
    .get() as { version_tag: string; config_json: string; created_at: string } | undefined;

  if (!row) {
    return {
      versionTag: 'v1.0.0',
      config: DEFAULT_SITE_CONFIG,
      activatedAt: new Date().toISOString(),
    };
  }

  try {
    const parsed = JSON.parse(row.config_json) as Partial<SiteRuntimeConfig>;
    return {
      versionTag: row.version_tag,
      config: { ...DEFAULT_SITE_CONFIG, ...parsed },
      activatedAt: row.created_at,
    };
  } catch {
    return {
      versionTag: row.version_tag,
      config: DEFAULT_SITE_CONFIG,
      activatedAt: row.created_at,
    };
  }
}
