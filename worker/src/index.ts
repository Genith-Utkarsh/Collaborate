import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './routes/auth.js';
import { projects } from './routes/projects.js';
import { users } from './routes/users.js';
import { getPrisma } from './db.js';

const app = new Hono();

app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type', 'Authorization'], allowMethods: ['GET','POST','PUT','DELETE','OPTIONS'] }));

app.get('/api/health', (c) => c.json({ status: 'success', message: 'Cloudflare Worker API healthy!' }));
app.get('/api/health/db', async (c) => {
	try {
		const prisma = getPrisma((c.env as any).DATABASE_URL);
		// Simple query to validate connectivity
		await prisma.$queryRaw`SELECT 1`;
		return c.json({ status: 'success', message: 'Database reachable' });
	} catch (e: any) {
		return c.json({ status: 'error', message: 'Database not reachable', detail: e?.message || String(e) }, 500);
	}
});

// Extra diagnostics: show DB/schema and whether core tables exist
app.get('/api/health/dbinfo', async (c) => {
		try {
			const prisma = getPrisma((c.env as any).DATABASE_URL);
			const dbRows = (await prisma.$queryRaw`SELECT current_database() as db, current_schema() as schema`) as any[];
			const dbRow = dbRows?.[0] || {};
			const tables = (await prisma.$queryRaw`
			SELECT table_name FROM information_schema.tables
			WHERE table_schema = 'public' AND table_name IN ('User','Project','Comment','UserFollow','ProjectLike','ProjectCollaborator')
			`) as any[];
		return c.json({ status: 'success', data: { db: dbRow?.db, schema: dbRow?.schema, tables: tables?.map(t => t.table_name) } });
	} catch (e: any) {
		return c.json({ status: 'error', message: 'DB info error', detail: e?.message || String(e) }, 500);
	}
});

app.route('/api/auth', auth);
app.route('/api/projects', projects);
app.route('/api/users', users);

// Always return JSON on unhandled errors
app.onError((err, c) => {
	console.error('Unhandled error:', err);
	return c.json({ status: 'error', message: 'Internal Server Error', detail: err?.message || String(err) }, 500);
});

export default app;
