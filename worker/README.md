Cloudflare Worker backend
-------------------------

This Worker replaces the legacy Express/Mongo backend under `../backend/`.

Implemented routes (parity):
- Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me, POST /api/auth/refresh
- Projects: 
  - GET /api/projects, GET /api/projects/:id, GET /api/projects/my-projects
  - POST /api/projects (JSON body)
  - PUT /api/projects/:id, DELETE /api/projects/:id
  - POST /api/projects/:id/like (toggle like), POST /api/projects/:id/comments
  - GET /api/projects/:id/readme, GET /api/projects/:id/contributors
- Users:
  - GET /api/users
  - GET /api/users/profile (current), GET /api/users/profile/:id
  - PUT /api/users/profile
  - POST /api/users/follow/:id, POST /api/users/unfollow/:id

Notes:
- GitHub OAuth endpoints exist as stubs and return 501 (not supported on Workers without custom OAuth): /api/auth/github, /api/auth/github/callback.
- Likes are user-based using `ProjectLike` join table. Comments stored in `Comment`.
- Prisma Accelerate Postgres is used via DATABASE_URL in wrangler.toml.
