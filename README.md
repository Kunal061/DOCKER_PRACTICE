# Practice Full-Stack Docker App (Frontend + Backend + MongoDB)

This repo is a tiny practice project to learn how to run a frontend + backend with Docker (locally and on an EC2 instance), with data persisted on the server.

## What's included

- `web`: React (Vite) built into static files and served by Nginx
- `api`: Node.js + Express REST API
- `db`: MongoDB 7 with a named Docker volume for persistence
- `mongo-express`: optional MongoDB web UI (Atlas-like browsing)

Ports (default):
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

API:
- `GET /health` -> `{ ok: true }`
- `GET /notes`
- `POST /notes` body: `{ "text": "..." }`

## Local run

1. Copy env file:
   - Windows PowerShell: `Copy-Item .env.example .env`
2. Start:
   - `docker compose up --build`
3. Verify:
   - Frontend: `http://localhost:$env:WEB_PORT` (or `http://localhost:3000`)
   - API health: `http://localhost:$env:API_PORT/health` (or `http://localhost:8080/health`)

### Persistence check

- `docker compose down`
- `docker compose up -d`

Notes should still be present (the `db_data` volume is kept).

If you run `docker compose down -v`, it deletes the volume and all data.

## MongoDB UI (Mongo Express)

For EC2 safety, `mongo-express` is bound to `127.0.0.1:8081` on the server, so it is reachable only via SSH tunnel.

1. Start the stack:
   - `docker compose up -d --build`
2. From your laptop, create an SSH tunnel:
   - `ssh -i key.pem -L 8081:localhost:8081 ubuntu@<EC2_PUBLIC_IP>`
3. Open:
   - `http://localhost:8081`
4. Login:
   - username: `app` (or your `MONGO_USER`)
   - password: your `MONGO_PASSWORD`

## Deploy to EC2 (Ubuntu)

Security Group inbound rules:
- TCP `22` (your IP only)
- TCP `80` (0.0.0.0/0)
- TCP `8080` (your IP recommended; 0.0.0.0/0 for practice)

On the EC2 instance:

1. Install Docker:
   - `curl -fsSL https://get.docker.com | sh`
   - `sudo usermod -aG docker ubuntu`
   - log out/in
2. Put this repo on the server:
   - `git clone ...` (recommended), or `scp` it up
3. Create `.env`:
   - set `WEB_PORT=80`
   - set a strong `MONGO_PASSWORD`
4. Run:
   - `docker compose up -d --build`
5. Verify:
   - `http://<EC2_PUBLIC_IP>/`
   - `http://<EC2_PUBLIC_IP>:8080/health`

