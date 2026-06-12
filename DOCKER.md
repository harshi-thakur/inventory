# Docker Setup Guide

## Overview

The Inventory Management System can run in multiple ways:

1. **Locally** (current setup) - `pnpm dev` for frontend, Python for backend
2. **Docker Production** - Optimized containers with Nginx (frontend) and Uvicorn (backend)
3. **Docker Development** - Hot-reload development environment

---

## Option 1: Local Development (Current Setup)

### Prerequisites
- Node.js 18+
- Python 3.12+
- PostgreSQL (or use Render's managed DB)

### Run Frontend
```bash
cd frontend
pnpm install
pnpm dev
# Visit http://localhost:5173
```

### Run Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\Activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# API at http://localhost:8000
# Docs at http://localhost:8000/docs
```

---

## Option 2: Docker Production Build

### Build and Run Frontend Only
```bash
cd frontend

# Build Docker image
docker build -t inventory-frontend:1.0 .

# Run container
docker run -d \
  --name inventory-frontend \
  -p 3000:80 \
  -e VITE_API_URL=http://localhost:8000 \
  inventory-frontend:1.0

# Visit http://localhost:3000
```

### Build and Run Backend Only
```bash
cd backend

# Build Docker image
docker build -t inventory-backend:1.0 .

# Run container
docker run -d \
  --name inventory-backend \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql+psycopg://user:pass@host:5432/db?sslmode=require \
  -e DEBUG=False \
  inventory-backend:1.0

# API at http://localhost:8000
```

---

## Option 3: Docker Compose (Full Stack)

### Run Everything Together
```bash
cd /path/to/inventory  # Root directory

# Build and start all services
docker-compose up --build

# In background:
docker-compose up -d --build
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

---

## Option 4: Docker Development Mode (Hot Reload)

### Frontend Development with Hot Reload
```bash
cd frontend

# Build dev image
docker build -f Dockerfile.dev -t inventory-frontend-dev:1.0 .

# Run with volume mount for hot reload
docker run -d \
  --name inventory-frontend-dev \
  -p 5173:5173 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/public:/app/public \
  -e VITE_API_URL=http://localhost:8000 \
  inventory-frontend-dev:1.0

# View logs
docker logs -f inventory-frontend-dev

# Visit http://localhost:5173
# Changes to files will trigger hot reload
```

### Using Docker Compose for Development
Uncomment the `frontend-dev` service in `docker-compose.yml`:

```yaml
frontend-dev:
  build:
    context: ./frontend
    dockerfile: Dockerfile.dev
  ports:
    - "5173:5173"
  volumes:
    - ./frontend/src:/app/src
    - ./frontend/public:/app/public
  # ...
```

Then:
```bash
docker-compose up -d frontend-dev backend

# Visit http://localhost:5173
# Changes to src/ will auto-reload
```

---

## Configuration

### Frontend Environment Variables

Create `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:8000
```

In Docker, pass via `-e` flag:
```bash
docker run -e VITE_API_URL=http://api.example.com ...
```

### Backend Environment Variables

Create `.env` file in `backend/`:
```env
DATABASE_URL=postgresql+psycopg://user:pass@host:5432/db?sslmode=require
DEBUG=False
```

In Docker, pass via `-e` flag:
```bash
docker run -e DATABASE_URL=postgresql+psycopg://... ...
```

---

## Common Docker Commands

### View Running Containers
```bash
docker ps
```

### View All Containers
```bash
docker ps -a
```

### Stop a Container
```bash
docker stop container-name
```

### Remove a Container
```bash
docker rm container-name
```

### View Container Logs
```bash
docker logs container-name
docker logs -f container-name  # Follow logs
```

### Remove an Image
```bash
docker rmi image-name
```

### Clean Up (Remove unused containers/images)
```bash
docker system prune
```

---

## Docker Files Reference

| File | Purpose |
|------|---------|
| `frontend/Dockerfile` | Production build with Nginx |
| `frontend/Dockerfile.dev` | Development build with hot reload |
| `frontend/.dockerignore` | Excludes unnecessary files from build |
| `frontend/nginx.conf` | Nginx configuration for SPA routing |
| `backend/Dockerfile` | Production build with Uvicorn |
| `backend/.dockerignore` | Excludes unnecessary files from build |
| `docker-compose.yml` | Orchestrates both services |

---

## Deployment Checklist

### Before Production:
- [ ] Test locally with `pnpm dev` and `python -m uvicorn ...`
- [ ] Build Docker images: `docker build -t frontend:1.0 .`
- [ ] Test Docker containers individually
- [ ] Test with Docker Compose
- [ ] Update environment variables for production
- [ ] Set `DEBUG=False` in backend `.env`
- [ ] Enable CORS for production domain if needed

### Deployment Platforms:
- **Railway** - Push to GitHub, Railway auto-builds Docker
- **Render** - Similar to Railway
- **AWS** - Use ECR + ECS/Fargate
- **Google Cloud** - Use Cloud Run
- **DigitalOcean** - Use App Platform or Docker droplet
- **Heroku** - Uses `Procfile` (simpler than Docker)

---

## Troubleshooting

### Frontend not connecting to backend
```bash
# Check backend is running
curl http://localhost:8000/

# Check frontend .env
cat frontend/.env

# Docker: check if API_URL is correct
docker exec inventory-frontend-dev env | grep VITE_API_URL
```

### Port already in use
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or use different port
docker run -p 3001:80 ...  # Use 3001 instead
```

### Permission denied in Docker
```bash
# Build as non-root (already done in our Dockerfiles)
# Or run with user flag
docker run --user node ...
```

### Hot reload not working in dev mode
- Ensure volume mount is correct: `-v $(pwd)/src:/app/src`
- Check file changes are detected: `docker logs -f container-name`
- Restart container if needed: `docker restart container-name`

---

## Performance Tips

**Production:**
- Frontend served by Nginx (fast static file serving)
- Gzip compression enabled
- Browser caching enabled (1 year for assets)
- API proxy optional (add to nginx.conf)

**Development:**
- Hot reload enabled
- Source maps for debugging
- Faster rebuilds with Vite

---

## Next Steps

1. **Verify Docker is installed**: `docker --version`
2. **Try local development first**: `pnpm dev` + backend
3. **Build Docker images**: `docker build -t ...`
4. **Test with Docker Compose**: `docker-compose up`
5. **Deploy to cloud** when ready

For any issues, check logs:
```bash
docker logs -f container-name
```

Happy coding! 🚀
