# Deployment guide

This guide targets a Linux VPS (Ubuntu 22.04 or 24.04) with Nginx and HTTPS. The backend serves the built frontend, the admin and the API from one origin, so there is one process to run.

## Before you deploy

- Use a new, strong admin password. Do not reuse your development one.
- Generate a new `JWT_SECRET` for production.
- Confirm no secrets are tracked: `git ls-files | grep -E '\.env$|\.gz|jar\.txt'` should print nothing.
- Run `npm audit --omit=dev` in `backend/` and review any findings.

## A note on uploaded files

Uploads are stored on disk in `backend/uploads`. Many platform-as-a-service hosts wipe the disk on every deploy, which deletes uploads. On those platforms you need a persistent volume. A VPS keeps files by default, so it is the simplest option.

## 1. Server setup

~~~bash
sudo apt update && sudo apt install -y nginx postgresql git ufw
# Install Node.js 20 or newer (NodeSource or nvm), then check:
node -v
sudo adduser --disabled-password --gecos "" portfolio
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
~~~

## 2. Database

~~~bash
sudo -u postgres psql
~~~

~~~sql
CREATE USER portfolio WITH PASSWORD 'a-long-random-password';
CREATE DATABASE portfolio_db OWNER portfolio;
\q
~~~

## 3. Get the code and build

~~~bash
sudo mkdir -p /srv/portfolio && sudo chown portfolio:portfolio /srv/portfolio
sudo -iu portfolio
git clone https://github.com/JOHNMAVERICK23/john-maverick-portfolio.git /srv/portfolio
cd /srv/portfolio
npm --prefix frontend ci && npm run build
npm --prefix backend ci --omit=dev
~~~

## 4. Configure

Create `/srv/portfolio/backend/.env` and restrict it with `chmod 600 .env`:

~~~
PORT=5000
HOST=127.0.0.1
TRUST_PROXY=1
COOKIE_SECURE=true
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio_db
DB_USER=portfolio
DB_PASSWORD=the-password-from-step-2
JWT_SECRET=<generate a new 96-character hex value>
~~~

Then prepare the database and the first admin:

~~~bash
cd /srv/portfolio/backend
npm run migrate
npm run seed
npm run create-admin
~~~

Run `npm run seed` once only. It creates the default profile and settings rows that the admin pages edit.

## 5. Run as a service

Create `/etc/systemd/system/portfolio.service` (as root):

~~~
[Unit]
Description=Portfolio CMS
After=network.target postgresql.service

[Service]
Type=simple
User=portfolio
WorkingDirectory=/srv/portfolio/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
~~~

~~~bash
sudo systemctl daemon-reload
sudo systemctl enable --now portfolio
sudo systemctl status portfolio
curl -s http://127.0.0.1:5000/api/health
~~~

## 6. Nginx reverse proxy

Create `/etc/nginx/sites-available/portfolio`:

~~~
server {
    listen 80;
    server_name example.com www.example.com;
    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
~~~

`client_max_body_size 12m` matters. Nginx rejects request bodies over 1 MB by default, which breaks uploads (the app allows 10 MB per file).

~~~bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
~~~

Point your domain's DNS A record at the server first, then enable HTTPS:

~~~bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
~~~

With HTTPS on, `COOKIE_SECURE=true` lets the login cookie work. If you can log in on HTTP but not on HTTPS (or the reverse), check that setting first.

## 7. Backups

~~~bash
sudo -iu portfolio crontab -e
~~~

~~~
0 3 * * * cd /srv/portfolio/backend && npm run backup >> /srv/portfolio/backup.log 2>&1
~~~

Copy the `backups/` folder off the server regularly. A backup that lives only on the same machine is lost with that machine. Test a restore now and then (see the README).

## 8. Updating the site

~~~bash
sudo -iu portfolio
cd /srv/portfolio
git pull
npm --prefix frontend ci && npm run build
npm --prefix backend ci --omit=dev
cd backend && npm run migrate
sudo systemctl restart portfolio
~~~

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Blank page or missing styles | `npm run build` was not run, or `frontend/dist` is missing on the server |
| Uploads fail with 413 | `client_max_body_size` missing in Nginx |
| Login succeeds but the dashboard redirects back to login | `COOKIE_SECURE` does not match HTTP or HTTPS, or `TRUST_PROXY` is missing behind Nginx |
| Rate limit or `X-Forwarded-For` errors | `TRUST_PROXY=1` is missing |
| Server exits at start with a JWT message | `JWT_SECRET` is missing, short or still `change_me` |
| 502 Bad Gateway | The service is not running: `journalctl -u portfolio -n 50` |
