import { verifyJwt } from '../jwt';
import type { Env } from '../env';
import { type Context, type Next } from 'hono';

export async function authMiddleware(c: Context<Env>, next: Next) {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ status: 'error', message: 'Unauthorized' }, 401);
  }
  const token = auth.slice('Bearer '.length);
  try {
  const payload = await verifyJwt(token, c.env.JWT_SECRET);
  c.set('user', payload);
    await next();
  } catch (e) {
    return c.json({ status: 'error', message: 'Invalid token' }, 401);
  }
}
