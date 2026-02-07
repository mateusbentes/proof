# Setup Guide

## Prerequisites

- Docker & Docker Compose
- 8GB+ RAM
- 20GB+ disk space

## Installation

### 1. Install Docker

**macOS:**
```bash
brew install docker
```

**Ubuntu/Debian:**
```bash
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

**Windows:**
Download Docker Desktop from https://www.docker.com/products/docker-desktop

### 2. Clone Repository
```bash
git clone <repo-url>
cd proof
```

### 3. Start Services
```bash
docker-compose up -d
```

### 4. Wait for Startup
```bash
docker-compose logs -f
```

You'll see:
```
Creating proof-redis    ... done
Creating proof-rasa     ... done
Creating proof-postgres ... done
Creating proof-ollama   ... done
Creating proof-backend  ... done
Creating proof-frontend ... done
```

### 5. Visit Application
Open http://localhost:3000

## Configuration

### Environment Variables

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - OLLAMA_MODEL=mistral        # Change AI model
      - OLLAMA_NUM_THREAD=8         # Change threads
      - NODE_ENV=production         # Change environment
```

### Database Configuration

```yaml
postgres:
  environment:
    - POSTGRES_USER=proof
    - POSTGRES_PASSWORD=proof_password
    - POSTGRES_DB=proof_db
```

### Redis Configuration

```yaml
redis:
  ports:
    - "6379:6379"
```

### Rasa Configuration

```yaml
rasa:
  ports:
    - "5005:5005"
```

## Troubleshooting

### Services won't start
```bash
docker-compose logs
docker-compose build --no-cache
docker-compose up -d
```

### Out of memory
```bash
docker stats
# Increase Docker memory limit
# Or use smaller model: mistral:7b-q4_0
```

### Database connection error
```bash
docker-compose exec postgres psql -U proof -d proof_db
```

### Ollama model download stuck
```bash
docker-compose logs -f ollama
docker-compose restart ollama
```

### Port already in use
```bash
lsof -i :3000
kill -9 <PID>
# Or change ports in docker-compose.yml
```

## Updating

### Update services
```bash
docker-compose pull
docker-compose up -d --build
```

### Update models
```bash
docker-compose exec ollama ollama pull llama2
# Edit docker-compose.yml: OLLAMA_MODEL=llama2
docker-compose restart backend
```

### Update code
```bash
git pull origin main
docker-compose up -d --build
```

## Backup & Restore

### Backup database
```bash
docker-compose exec postgres pg_dump -U proof proof_db > backup.sql
```

### Restore database
```bash
docker-compose exec -T postgres psql -U proof proof_db < backup.sql
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d
```

## Performance Tuning

### Enable GPU
Edit `docker-compose.yml`:
```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

### Increase threads
```yaml
ollama:
  environment:
    - OLLAMA_NUM_THREAD=16
```

### Increase memory
```yaml
ollama:
  deploy:
    resources:
      limits:
        memory: 16G
```

## Production Deployment

### Use production compose file
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Use reverse proxy
Add nginx service to docker-compose.yml for SSL/TLS

### Monitor services
```bash
docker stats
docker-compose logs -f
```

## Support

- **Ollama**: https://github.com/ollama/ollama
- **Rasa**: https://rasa.com
- **Docker**: https://docs.docker.com
