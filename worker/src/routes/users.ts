import { Hono } from 'hono';
import { getPrisma } from '../db';

type AppEnv = {
  Bindings: { DATABASE_URL: string; JWT_SECRET: string };
};

export const users = new Hono<AppEnv>();

users.get('/', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const list = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return c.json({ status: 'success', data: { users: list, pagination: { currentPage: 1, totalPages: 1, hasNext: false, hasPrev: false, totalUsers: list.length } } });
});

users.get('/profile/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return c.json({ status: 'error', message: 'Not found' }, 404);
  return c.json({ status: 'success', data: user });
});
