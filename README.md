<p align="center">
# John Maverick Portfolio CMS
</p>
A full-stack personal portfolio with an admin CMS. Every piece of public content (profile, projects, skills, experience, certificates, education, settings) is stored in PostgreSQL and edited through a protected dashboard, so changes appear on the public site right away.

## Features

- Public portfolio: home, about, skills, projects (with gallery and filters), experience, certificates, education and a contact form
- Dark and light mode, responsive layout, accessible components
- Admin CMS: dashboard stats and activity log, CRUD for every content type, image and PDF uploads, featured and publish toggles, ordering, search and pagination, message inbox
- Website settings: title, logo, favicon, SEO fields and per-section visibility
- Secure by default: bcrypt hashing, JWT in an HTTP-only cookie, validated input, rate limiting, upload type and size checks with file-signature verification

## Tech stack

<p align="center">
<img alt="React" src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
<img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-0F172A?style=flat-square&logo=tailwindcss&logoColor=38BDF8" />
<img alt="React Router" src="https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white" />
<img alt="Axios" src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white" />
<img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
<img alt="Express" src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
<img alt="JWT" src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
<img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
<img alt="Supabase" src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white" />
<img alt="Render" src="https://img.shields.io/badge/Render-000000?style=flat-square&logo=render&logoColor=white" />
<img alt="GitHub" src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" />
</p>
## Project structure

~~~
frontend/            React app (public site and /admin)
backend/
  src/config/        database config
  src/controllers/   request handlers
  src/db/            migrations, seeders, migration runner, createAdmin
  src/middleware/    auth, uploads, error handling, frontend serving
  src/routes/        public, auth and admin routes
  scripts/           smoke test and backup
  uploads/           uploaded files (not committed)
docs/DEPLOYMENT.md   production deployment guide
~~~

## Local setup

Requires Node.js 20 or newer and PostgreSQL. On Android Termux: `pkg install nodejs postgresql git`.

~~~bash
git clone https://github.com/JOHNMAVERICK23/john-maverick-portfolio.git
cd john-maverick-portfolio
createdb portfolio_db

cd backend
npm install
cp .env.example .env        # then edit DB_USER and JWT_SECRET
npm run migrate             # create tables
npm run seed                # default profile and settings rows
npm run create-admin        # first admin (no public registration)
npm run dev                 # API on http://localhost:5000

cd ../frontend              # in a second terminal
npm install
npm run dev                 # site on http://localhost:5173, admin at /admin/login
~~~

Termux PostgreSQL, first time only:

~~~bash
mkdir -p $PREFIX/var/lib/postgresql
initdb $PREFIX/var/lib/postgresql
pg_ctl -D $PREFIX/var/lib/postgresql start
~~~

The Vite dev server proxies `/api` and `/uploads` to the backend, so both run on one origin and the login cookie works.

## Environment variables (backend/.env)

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default 5000) |
| `HOST` | Optional bind address, for example `127.0.0.1` behind a reverse proxy |
| `TRUST_PROXY` | Set to `1` when running behind Nginx or another proxy |
| `CLIENT_URL` | Allowed origin for CORS in development |
| `COOKIE_SECURE` | `true` when the site is served over HTTPS |
| `DATABASE_URL` | Full connection string (takes priority over the `DB_*` values) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Database connection |
| `DB_SSL` | `true` to verify the server certificate, `no-verify` to skip verification |
| `JWT_SECRET` | At least 32 random characters. The server refuses to start with a weak value |

Generate a secret with:

~~~bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
~~~

Never commit `.env`. Only `.env.example` belongs in the repository.

## Scripts

Run from `backend/` unless noted.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the API with auto-reload |
| `npm start` | Start the API |
| `npm run migrate` | Apply pending SQL migrations |
| `npm run seed` | Apply seeders (default profile, settings, skill categories) |
| `npm run create-admin` | Create an admin account interactively |
| `npm run smoke` | Run the API smoke test against a running server |
| `npm run backup` | Dump the database and uploads into `../backups` |

From the repository root: `npm run build` builds the frontend, and `npm start` runs the API in production mode. When `frontend/dist` exists, the backend serves the site, the admin and the API from one origin.

## API overview

Public (no login): `GET /api/profile`, `/api/settings`, `/api/projects`, `/api/projects/:slug`, `/api/skills`, `/api/experiences`, `/api/certificates`, `/api/education`, and `POST /api/contact` (validated and rate limited).

Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.

Admin (login required), under `/api/admin`:

- `GET /dashboard`
- `GET` and `PUT /profile`, `GET` and `PUT /settings`
- `projects`, `skills`, `skill-categories`, `experiences`, `certificates`, `education`, `social-links`: list, create, read, update, delete and `PUT /reorder`
- `DELETE /projects/:id/images/:imageId`
- `messages`: list with search and filter, read, mark read or unread, delete

## Security notes

- There is no public admin registration. Create admins only with `npm run create-admin`.
- Login is limited to 10 attempts per 15 minutes per IP, and the contact form to 5 messages per hour.
- Uploads accept JPG, PNG, WebP and PDF only, up to 10 MB. Contents are checked against the file type, and SVG is not accepted.
- Link fields accept only `http://` and `https://` URLs.
- Backups contain password hashes and visitor messages. Keep them out of the repository.

## Testing

With the API running, `npm run smoke` in `backend/` exercises the public API, route protection, login, CRUD for every resource, validation, uploads and cleanup. It removes everything it creates. Set `WITH_CONTACT=1` to include the contact form (counts toward its rate limit).

## Backups

`npm run backup` writes `backups/db-<timestamp>.sql.gz` and `backups/uploads-<timestamp>.tar.gz`. Restore into an empty database:

~~~bash
createdb portfolio_db
gunzip -c backups/db-<timestamp>.sql.gz | psql portfolio_db
tar -xzf backups/uploads-<timestamp>.tar.gz -C backend/uploads
~~~
