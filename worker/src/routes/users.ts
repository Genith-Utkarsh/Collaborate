import { Hono } from 'hono';
import { getPrisma } from '../db';
import { jwtVerify } from 'jose';

type AppEnv = {
  Bindings: { DATABASE_URL: string; JWT_SECRET: string };
};

export const users = new Hono<AppEnv>();

async function getAuth(c: any) {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice('Bearer '.length);
  try {
    const key = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, key);
    return payload as any;
  } catch {
    return null;
  }
}

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

// Get current user profile
users.get('/profile', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const authed = await getAuth(c);
  if (!authed?.sub) return c.json({ status: 'error', message: 'Unauthorized' }, 401);
  const user = await prisma.user.findUnique({ where: { id: authed.sub as string } });
  if (!user) return c.json({ status: 'error', message: 'User not found' }, 404);
  const { password, ...safe } = user as any;
  return c.json({ status: 'success', data: { user: safe } });
});

// Update profile
users.put('/profile', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const authed = await getAuth(c);
  if (!authed?.sub) return c.json({ status: 'error', message: 'Unauthorized' }, 401);
  const body = await c.req.json<any>().catch(() => null);
  if (!body) return c.json({ status: 'error', message: 'Invalid JSON' }, 400);
  const { name, bio, year, branch, githubProfile, linkedinProfile, portfolioUrl, skills, avatar } = body;
  const updated = await prisma.user.update({
    where: { id: authed.sub as string },
    data: {
      name,
      bio,
      year,
      branch,
      githubProfile,
      linkedinProfile,
      portfolioUrl,
      avatar,
      skills: Array.isArray(skills) ? skills : typeof skills === 'string' ? skills.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
    },
  });
  const { password, ...safe } = updated as any;
  return c.json({ status: 'success', message: 'Profile updated successfully', data: { user: safe } });
});

// Follow user
users.post('/follow/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const authed = await getAuth(c);
  if (!authed?.sub) return c.json({ status: 'error', message: 'Unauthorized' }, 401);
  const targetId = c.req.param('id');
  if (targetId === (authed.sub as string)) return c.json({ status: 'error', message: 'Cannot follow yourself' }, 400);
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return c.json({ status: 'error', message: 'User not found' }, 404);
  const existing = await prisma.userFollow.findFirst({ where: { followerId: authed.sub as string, followingId: targetId } });
  if (existing) return c.json({ status: 'error', message: 'Already following this user' }, 400);
  await prisma.userFollow.create({ data: { followerId: authed.sub as string, followingId: targetId } });
  return c.json({ status: 'success', message: 'User followed successfully' });
});

// Unfollow user
users.post('/unfollow/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const authed = await getAuth(c);
  if (!authed?.sub) return c.json({ status: 'error', message: 'Unauthorized' }, 401);
  const targetId = c.req.param('id');
  if (targetId === (authed.sub as string)) return c.json({ status: 'error', message: 'Cannot unfollow yourself' }, 400);
  const existing = await prisma.userFollow.findFirst({ where: { followerId: authed.sub as string, followingId: targetId } });
  if (!existing) return c.json({ status: 'error', message: 'Not following this user' }, 400);
  await prisma.userFollow.delete({ where: { id: existing.id } });
  return c.json({ status: 'success', message: 'User unfollowed successfully' });
});
