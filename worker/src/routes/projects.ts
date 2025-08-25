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
  likes: p._count?.likes ?? (Array.isArray(p.likes) ? p.likes.length : 0),
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
  const list = await prisma.project.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { likes: true } } } });
  return c.json({ status: 'success', data: { projects: list.map(mapProject) } });
});

projects.get('/:id', async (c) => {
  const id = c.req.param('id');
  const prisma = getPrisma(c.env.DATABASE_URL);
  const proj = await prisma.project.findUnique({ where: { id }, include: { _count: { select: { likes: true } }, comments: { include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: 'desc' } } } });
  if (!proj) return c.json({ status: 'error', message: 'Not found' }, 404);
  // increment views (non-blocking)
  prisma.project.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});
  return c.json({ status: 'success', data: { project: mapProject(proj), comments: proj.comments } });
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
  include: { _count: { select: { likes: true } } },
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
  const user = await getAuth(c);
  if (!user) return c.json({ status: 'error', message: 'Unauthorized' }, 401);
  const exists = await prisma.project.findUnique({ where: { id } });
  if (!exists) return c.json({ status: 'error', message: 'Not found' }, 404);
  const existingLike = await prisma.projectLike.findFirst({ where: { projectId: id, userId: user.sub as string } });
  let liked: boolean;
  if (existingLike) {
    await prisma.projectLike.delete({ where: { id: existingLike.id } });
    liked = false;
  } else {
    await prisma.projectLike.create({ data: { projectId: id, userId: user.sub as string } });
    liked = true;
  }
  const likesCount = await prisma.projectLike.count({ where: { projectId: id } });
  return c.json({ status: 'success', data: { liked, likesCount } });
});

// Update project
projects.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<any>().catch(() => null);
  if (!body) return c.json({ status: 'error', message: 'Invalid JSON' }, 400);
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await getAuth(c);
  if (!user) return c.json({ status: 'error', message: 'Unauthorized' }, 401);
  const proj = await prisma.project.findUnique({ where: { id } });
  if (!proj) return c.json({ status: 'error', message: 'Not found' }, 404);
  if (proj.ownerId && proj.ownerId !== (user.sub as string) && (user.role as string) !== 'admin') {
    return c.json({ status: 'error', message: 'Forbidden' }, 403);
  }
  const { title, description, longDescription, technologies, tags, category, githubUrl, liveUrl, images, logoUrl } = body;
  const updated = await prisma.project.update({
    where: { id },
    data: {
      title,
      description,
      longDescription,
      technologies: Array.isArray(technologies) ? technologies : Array.isArray(tags) ? tags : undefined,
      category,
      githubUrl,
      liveUrl,
      images: Array.isArray(images) ? images : logoUrl ? [logoUrl] : undefined,
    },
  });
  return c.json({ status: 'success', data: { project: mapProject(updated) } });
});

// Delete project
projects.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await getAuth(c);
  if (!user) return c.json({ status: 'error', message: 'Unauthorized' }, 401);
  const proj = await prisma.project.findUnique({ where: { id } });
  if (!proj) return c.json({ status: 'error', message: 'Not found' }, 404);
  if (proj.ownerId && proj.ownerId !== (user.sub as string) && (user.role as string) !== 'admin') {
    return c.json({ status: 'error', message: 'Forbidden' }, 403);
  }
  await prisma.project.delete({ where: { id } });
  return c.json({ status: 'success', message: 'Project deleted successfully' });
});

// Add comment
projects.post('/:id/comments', async (c) => {
  const id = c.req.param('id');
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await getAuth(c);
  if (!user) return c.json({ status: 'error', message: 'Unauthorized' }, 401);
  const body = await c.req.json<{ text: string }>().catch(() => null);
  if (!body?.text) return c.json({ status: 'error', message: 'Text is required' }, 400);
  const exists = await prisma.project.findUnique({ where: { id } });
  if (!exists) return c.json({ status: 'error', message: 'Not found' }, 404);
  const comment = await prisma.comment.create({ data: { text: body.text, projectId: id, userId: user.sub as string }, include: { user: { select: { id: true, name: true, avatar: true } } } });
  return c.json({ status: 'success', data: { comment } }, 201);
});

// Helper to parse owner/repo from GitHub URL
function parseRepo(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    if (u.hostname !== 'github.com') return null;
    const [owner, repo] = u.pathname.replace(/^\//, '').split('/');
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

// Get README.md content
projects.get('/:id/readme', async (c) => {
  const id = c.req.param('id');
  const prisma = getPrisma(c.env.DATABASE_URL);
  const proj = await prisma.project.findUnique({ where: { id } });
  if (!proj) return c.json({ status: 'error', message: 'Not found' }, 404);
  const parsed = parseRepo(proj.githubUrl);
  if (!parsed) return c.json({ status: 'error', message: 'Invalid GitHub URL' }, 400);
  const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/HEAD/README.md`;
  const resp = await fetch(rawUrl);
  if (!resp.ok) return c.json({ status: 'error', message: 'README not found' }, 404);
  const text = await resp.text();
  return c.json({ status: 'success', data: { readme: text } });
});

// Get contributors
projects.get('/:id/contributors', async (c) => {
  const id = c.req.param('id');
  const prisma = getPrisma(c.env.DATABASE_URL);
  const proj = await prisma.project.findUnique({ where: { id } });
  if (!proj) return c.json({ status: 'error', message: 'Not found' }, 404);
  const parsed = parseRepo(proj.githubUrl);
  if (!parsed) return c.json({ status: 'error', message: 'Invalid GitHub URL' }, 400);
  const resp = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contributors?per_page=100`);
  if (!resp.ok) return c.json({ status: 'error', message: 'Failed to fetch contributors' }, 502);
  const contributors = await resp.json();
  return c.json({ status: 'success', data: { contributors } });
});

// Refresh GitHub data
projects.post('/:id/refresh-github', async (c) => {
  const id = c.req.param('id');
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await getAuth(c);
  if (!user) return c.json({ status: 'error', message: 'Unauthorized' }, 401);
  const proj = await prisma.project.findUnique({ where: { id } });
  if (!proj) return c.json({ status: 'error', message: 'Not found' }, 404);
  if (proj.ownerId && proj.ownerId !== (user.sub as string) && (user.role as string) !== 'admin') {
    return c.json({ status: 'error', message: 'Forbidden' }, 403);
  }
  const parsed = parseRepo(proj.githubUrl);
  if (!parsed) return c.json({ status: 'error', message: 'Invalid GitHub URL' }, 400);
  const resp = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);
  if (!resp.ok) return c.json({ status: 'error', message: 'Failed to fetch repo' }, 502);
  const repo = await resp.json();
  const data = {
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    language: repo.language ?? 'Unknown',
    lastUpdated: repo.updated_at ? new Date(repo.updated_at) : new Date(),
    watchers: repo.subscribers_count ?? 0,
  };
  // Cast to any/JsonValue to satisfy Prisma types in edge client
  // Skipping DB persistence in this environment; return fetched summary
  return c.json({ status: 'success', data: { githubData: data } });
});
