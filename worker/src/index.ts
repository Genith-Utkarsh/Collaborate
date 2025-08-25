import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './routes/auth.js';
import { projects } from './routes/projects.js';
import { users } from './routes/users.js';

const app = new Hono();

app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type', 'Authorization'], allowMethods: ['GET','POST','PUT','DELETE','OPTIONS'] }));

app.get('/api/health', (c) => c.json({ status: 'success', message: 'Cloudflare Worker API healthy!' }));

app.route('/api/auth', auth);
app.route('/api/projects', projects);
app.route('/api/users', users);

export default app;
