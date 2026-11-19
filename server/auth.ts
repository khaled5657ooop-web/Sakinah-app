import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';

const COOKIE_NAME = 'sakinah_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const SECRET_FILE = path.resolve(process.cwd(), 'data', '.session_secret');

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  try {
    if (fs.existsSync(SECRET_FILE)) {
      const existing = fs.readFileSync(SECRET_FILE, 'utf8').trim();
      if (existing.length >= 32) return existing;
    }
    const generated = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(SECRET_FILE, generated, { mode: 0o600 });
    return generated;
  } catch {
    return crypto.randomBytes(32).toString('hex');
  }
}

const SESSION_SECRET = getSessionSecret();

// Simple in-memory login rate limiter (max 8 attempts / 15 minutes per IP)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return { allowed: true };
  }
  if (entry.count >= 8) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  entry.count += 1;
  return { allowed: true };
}

export function resetLoginRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

export function hasAdminPasswordConfigured(): {
  configured: boolean;
  mode: 'env' | 'database' | 'unconfigured';
} {
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length > 0) {
    return { configured: true, mode: 'env' };
  }
  const row = db.prepare('SELECT id FROM admin_credentials WHERE id = 1').get() as
    | { id: number }
    | undefined;
  if (row) {
    return { configured: true, mode: 'database' };
  }
  return { configured: false, mode: 'unconfigured' };
}

export function setupInitialAdminPassword(password: string): void {
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length > 0) {
    throw new Error('كلمة المرور الإدارية مضبوطة مسبقًا عبر متغيرات البيئة.');
  }
  const existing = db.prepare('SELECT id FROM admin_credentials WHERE id = 1').get();
  if (existing) {
    throw new Error('تم إعداد كلمة مرور الإدارة مسبقًا ولا يمكن إعادة التهيئة من الواجهة.');
  }
  if (!password || password.length < 8) {
    throw new Error('يجب أن تكون كلمة المرور الإدارية 8 أحرف على الأقل.');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO admin_credentials (id, password_hash, salt, created_at, updated_at)
    VALUES (1, ?, ?, ?, ?)
  `).run(hash, salt, now, now);
}

export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;

  const envPass = process.env.ADMIN_PASSWORD?.trim();
  if (envPass) {
    const a = crypto.createHash('sha256').update(password).digest();
    const b = crypto.createHash('sha256').update(envPass).digest();
    return crypto.timingSafeEqual(a, b);
  }

  const row = db
    .prepare('SELECT password_hash, salt FROM admin_credentials WHERE id = 1')
    .get() as { password_hash: string; salt: string } | undefined;

  if (!row) return false;
  const derived = crypto.scryptSync(password, row.salt, 64);
  const stored = Buffer.from(row.password_hash, 'hex');
  if (derived.length !== stored.length) return false;
  return crypto.timingSafeEqual(derived, stored);
}

export function createSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      exp: Date.now() + SESSION_TTL_MS,
      nonce: crypto.randomBytes(12).toString('hex'),
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;

  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    return decoded.role === 'admin' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export function parseCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    if (key === name) {
      return decodeURIComponent(pair.slice(idx + 1).trim());
    }
  }
  return undefined;
}

export function setAdminCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: SESSION_TTL_MS,
  });
}

export function clearAdminCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

export function isRequestAdmin(req: Request): boolean {
  const cookieToken = parseCookie(req.headers.cookie, COOKIE_NAME);
  if (verifySessionToken(cookieToken)) return true;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return verifySessionToken(authHeader.slice(7).trim());
  }
  return false;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!isRequestAdmin(req)) {
    res.status(401).json({
      error: 'يجب تسجيل الدخول بصلاحيات الإدارة للوصول إلى هذا الإجراء.',
    });
    return;
  }
  next();
}

export function isCronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const provided =
      (req.headers['x-cron-secret'] as string | undefined) ||
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7).trim() : undefined);
    if (provided) {
      const a = crypto.createHash('sha256').update(provided).digest();
      const b = crypto.createHash('sha256').update(secret).digest();
      if (crypto.timingSafeEqual(a, b)) return true;
    }
  }
  return isRequestAdmin(req);
}
