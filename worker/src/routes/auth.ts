import { Hono } from 'hono';
import type { JWTPayload } from '../jwt';
import { signJwt } from '../jwt';
import { getPrisma } from '../db';
import bcrypt from 'bcryptjs';

type AppEnv = {
  Bindings: { DATABASE_URL: string; JWT_SECRET: string };
  Variables: { user: JWTPayload };
};

export const auth = new Hono<AppEnv>();

auth.post('/register', async (c) => {
  try {
    const body = await c.req.json<{ name: string; email: string; password: string; year: string; branch: string; bio?: string; skills?: string[] }>().catch(() => null);
    if (!body) return c.json({ status: 'error', message: 'Invalid JSON' }, 400);
    const { name, email, password, year, branch, bio, skills } = body;
    if (!name || !email || !password || !year || !branch) {
      return c.json({ status: 'error', message: 'Missing required fields' }, 400);
    }
    const normalizedEmail = email.trim().toLowerCase();
    const prisma = getPrisma(c.env.DATABASE_URL);
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return c.json({ status: 'error', message: 'Email already registered' }, 409);

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: hash, year, branch, bio: bio || undefined, skills: skills || [] }
    });

    const token = await signJwt({ sub: user.id, email: user.email, name: user.name, role: (user.role as any) || 'student' }, c.env.JWT_SECRET);
    const safe = { ...user, password: undefined } as any;
    return c.json({ status: 'success', data: { user: safe, token } });
  } catch (e: any) {
    return c.json({ status: 'error', message: 'Internal Server Error', detail: e?.message || String(e) }, 500);
  }
});

auth.post('/login', async (c) => {
  try {
    const body = await c.req.json<{ email: string; password: string }>().catch(() => null);
    if (!body) return c.json({ status: 'error', message: 'Invalid JSON' }, 400);
    const { email, password } = body;
    const normalizedEmail = email.trim().toLowerCase();
    const prisma = getPrisma(c.env.DATABASE_URL);
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.password) return c.json({ status: 'error', message: 'Invalid credentials' }, 401);
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return c.json({ status: 'error', message: 'Invalid credentials' }, 401);
    const token = await signJwt({ sub: user.id, email: user.email, name: user.name, role: (user.role as any) || 'student' }, c.env.JWT_SECRET);
    const safe = { ...user, password: undefined } as any;
    return c.json({ status: 'success', data: { user: safe, token } });
  } catch (e: any) {
    return c.json({ status: 'error', message: 'Internal Server Error', detail: e?.message || String(e) }, 500);
  }
});

auth.get('/me', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ status: 'error', message: 'Unauthorized' }, 401);
  const token = auth.slice('Bearer '.length);
  try {
    const { jwtVerify } = await import('jose');
    const key = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, key);
    const prisma = getPrisma(c.env.DATABASE_URL);
    const user = await prisma.user.findUnique({ where: { id: payload.sub as string } });
    if (!user) return c.json({ status: 'error', message: 'User not found' }, 404);
    const safe = { ...user, password: undefined };
    return c.json({ status: 'success', data: { user: safe } });
  } catch (e) {
    return c.json({ status: 'error', message: 'Invalid token' }, 401);
  }
});

auth.post('/refresh', async (c) => {
  const body = await c.req.json<{ token: string }>().catch(() => null);
  if (!body?.token) return c.json({ status: 'error', message: 'Token required' }, 400);
  try {
    const { jwtVerify } = await import('jose');
    const key = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(body.token, key);
    // issue a new token with same payload
    const token = await signJwt({ sub: payload.sub as string, email: payload.email as string, name: payload.name as string, role: (payload.role as any) || 'student' }, c.env.JWT_SECRET);
    return c.json({ status: 'success', data: { token } });
  } catch (e) {
    return c.json({ status: 'error', message: 'Invalid token' }, 401);
  }
});

// GitHub OAuth stubs to preserve API shape
auth.get('/github', (c) => {
  return c.json({ status: 'error', message: 'GitHub OAuth not configured on Workers. Use email/password.' }, 501);
});

auth.get('/github/callback', (c) => {
  const frontend = c.req.query('redirect') || c.req.header('X-Frontend-URL') || '/';
  return c.redirect(`${frontend}?error=oauth_not_supported`);
});
