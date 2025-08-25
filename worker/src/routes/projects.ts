import { Hono } from 'hono';
import { getPrisma } from '../db';
import { jwtVerify } from 'jose';

type AppEnv = {
  Bindings: { DATABASE_URL: string; JWT_SECRET: string };
};

export const projects = new Hono<AppEnv>();

const mapProject = (p: any) => ({
  _id: p.id,
  title: p.title,
  description: p.description,
  ownerName: p.ownerName || null,
  githubUrl: p.githubUrl,
  tags: p.technologies || [],
  logoUrl: Array.isArray(p.images) && p.images.length ? p.images[0] : undefined,
  githubData: p.githubData || null,
  likes: p.likes ? p.likes.length : 0,
  likedBy: [],
  createdAt: p.createdAt,
});

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

projects.get('/', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const list = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  return c.json({ status: 'success', data: { projects: list.map(mapProject) } });
});

projects.get('/:id', async (c) => {
  const id = c.req.param('id');
  const prisma = getPrisma(c.env.DATABASE_URL);
  const proj = await prisma.project.findUnique({ where: { id }, include: { comments: true } });
  if (!proj) return c.json({ status: 'error', message: 'Not found' }, 404);
  return c.json({ status: 'success', data: mapProject(proj) });
});

projects.get('/my-projects', async (c) => {
  const user = await getAuth(c);
  if (!user) return c.json({ status: 'error', message: 'Unauthorized' }, 401);
  const prisma = getPrisma(c.env.DATABASE_URL);
  const list = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: user.sub as string },
        user.name ? { ownerName: user.name as string } : undefined,
      ].filter(Boolean) as any,
    },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ status: 'success', data: { projects: list.map(mapProject) } });
});

projects.post('/', async (c) => {
  const body = await c.req.json<any>().catch(() => null);
  if (!body) return c.json({ status: 'error', message: 'Invalid JSON' }, 400);
  const { title, description, githubUrl, tags, category, logoUrl, ownerName } = body;
  if (!title || !description || !githubUrl) return c.json({ status: 'error', message: 'Missing required fields' }, 400);
  const authed = await getAuth(c);
  const prisma = getPrisma(c.env.DATABASE_URL);
  const created = await prisma.project.create({
    data: {
      title,
      description,
      githubUrl,
      category: category || 'Other',
      technologies: Array.isArray(tags) ? tags : [],
      images: logoUrl ? [logoUrl] : [],
      ownerName: (authed?.name as string) || ownerName || null,
      ownerId: (authed?.sub as string) || null,
    },
  });
  return c.json({ status: 'success', data: { _id: created.id } }, 201);
});

projects.post('/:id/like', async (c) => {
  const id = c.req.param('id');
  const prisma = getPrisma(c.env.DATABASE_URL);
  const exists = await prisma.project.findUnique({ where: { id } });
  if (!exists) return c.json({ status: 'error', message: 'Not found' }, 404);
  // For simplicity, we won't enforce unique user likes here; increment a counter via views for demo
  await prisma.project.update({ where: { id }, data: { views: { increment: 1 } } });
  return c.json({ status: 'success' });
});
