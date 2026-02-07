# Docker Quick Start - Run Everything in One Command

Run the entire Proof platform with Docker Compose in just 2 commands!

## ⚡ Super Quick Start (2 Commands)

```bash
# 1. Start everything
docker-compose up -d

# 2. Wait for Ollama to download the model (2-3 minutes)
docker-compose logs -f ollama

# 3. Visit http://localhost:3000
```

That's it! Everything is running. 🎉

---

## 📋 Prerequisites

- Docker installed
- Docker Compose installed
- 8GB+ RAM
- 20GB+ disk space

### Install Docker

**macOS:**
```bash
brew install docker
# Or download Docker Desktop from https://www.docker.com/products/docker-desktop
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

**Windows:**
Download Docker Desktop from https://www.docker.com/products/docker-desktop

---

## 🚀 Full Docker Setup

### 1. Clone Repository
```bash
git clone <repo-url>
cd proof
```

### 2. Start All Services
```bash
docker-compose up -d
```

This will:
- ✅ Start Ollama (AI model server)
- ✅ Download Mistral model (4.1GB)
- ✅ Start Backend (Node.js API)
- ✅ Start Frontend (React app)

### 3. Wait for Services to Start
```bash
# Watch the logs
docker-compose logs -f

# Or check individual services
docker-compose logs -f ollama
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. Verify Everything is Running
```bash
# Check all containers
docker-compose ps

# Should show:
# NAME                STATUS
# proof-ollama        Up (healthy)
# proof-backend       Up (healthy)
# proof-frontend      Up (healthy)
```

### 5. Verify Database is Running

```bash
# Check PostgreSQL is healthy
docker-compose ps postgres

# Should show: proof-postgres ... Up (healthy)
```

### 6. Visit the Application
Open http://localhost:3000 in your browser

---

## 🎯 Common Commands

### Start Services
```bash
docker-compose up -d
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
docker-compose logs -f ollama
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services
```bash
docker-compose restart

# Or specific service
docker-compose restart backend
```

### Remove Everything (Clean Slate)
```bash
docker-compose down -v
```

### Rebuild Images
```bash
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔧 Configuration

### Change AI Model

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - OLLAMA_MODEL=llama2  # Change from mistral to llama2
```

Then restart:
```bash
docker-compose restart backend
```

### Change Ports

Edit `docker-compose.yml`:

```yaml
services:
  ollama:
    ports:
      - "11435:11434"  # Change from 11434 to 11435
  
  backend:
    ports:
      - "3002:3001"    # Change from 3001 to 3002
  
  frontend:
    ports:
      - "3001:3000"    # Change from 3000 to 3001
```

### Increase Resources

Edit `docker-compose.yml`:

```yaml
services:
  ollama:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 16G
        reservations:
          cpus: '2'
          memory: 8G
```

---

## 🗄️ Database

### PostgreSQL Configuration

The database is automatically configured with:
- **Host**: postgres
- **Port**: 5432
- **Database**: proof_db
- **User**: proof
- **Password**: proof_password

### Connect to Database

```bash
# From inside backend container
docker-compose exec backend psql -h postgres -U proof -d proof_db

# From your machine
psql -h localhost -U proof -d proof_db
```

### Database Commands

```bash
# View all databases
docker-compose exec postgres psql -U proof -l

# View tables
docker-compose exec postgres psql -U proof -d proof_db -c "\dt"

# Backup database
docker-compose exec postgres pg_dump -U proof proof_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U proof proof_db < backup.sql
```

### Reset Database

```bash
# Stop services
docker-compose down

# Remove database volume
docker volume rm proof_postgres_data

# Start again
docker-compose up -d
```

---

## 📊 Monitoring

### Check Container Status
```bash
docker-compose ps
```

### View Resource Usage
```bash
docker stats
```

### Check Logs
```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f backend
```

### Test API Endpoints
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Check Backend status
curl http://localhost:3001/api/local-ai/status

# Test conversation
curl -X POST http://localhost:3001/api/local-ai/continue-conversation \
  -H "Content-Type: application/json" \
  -d '{
    "conversationHistory": [
      {"role": "user", "content": "Hello"}
    ],
    "messageCount": 1
  }'
```

---

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache

# Start again
docker-compose up -d
```

### Out of Memory

```bash
# Check memory usage
docker stats

# Increase Docker memory limit
# Docker Desktop: Preferences → Resources → Memory

# Or use smaller model
# Edit docker-compose.yml:
# OLLAMA_MODEL=mistral:7b-q4_0
```

### Ollama Model Download Stuck

```bash
# Check logs
docker-compose logs -f ollama

# If stuck, restart
docker-compose restart ollama

# Check available disk space
df -h
```

### Backend Can't Connect to Ollama

```bash
# Check if Ollama is healthy
docker-compose ps

# Check Ollama logs
docker-compose logs ollama

# Verify connection
docker-compose exec backend curl http://ollama:11434/api/tags
```

### Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs -f frontend

# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Port Already in Use

```bash
# Find what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :11434

# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

---

## 🔄 Updating

### Update Images
```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Update Code
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build
```

### Update Models
```bash
# Pull new model
docker-compose exec ollama ollama pull llama2

# Update docker-compose.yml to use new model
# OLLAMA_MODEL=llama2

# Restart backend
docker-compose restart backend
```

---

## 📈 Performance Tuning

### Enable GPU Acceleration

Edit `docker-compose.yml`:

```yaml
services:
  ollama:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

Then restart:
```bash
docker-compose up -d
```

### Increase Threads

Edit `docker-compose.yml`:

```yaml
services:
  ollama:
    environment:
      - OLLAMA_NUM_THREAD=16  # Increase from 8
```

### Optimize Memory

```yaml
services:
  ollama:
    deploy:
      resources:
        limits:
          memory: 16G
```

---

## 🔒 Security

### Use Environment File

Create `.env` file:

```bash
OLLAMA_MODEL=mistral
OLLAMA_NUM_THREAD=8
NODE_ENV=production
```

Update `docker-compose.yml`:

```yaml
services:
  backend:
    env_file: .env
```

### Restrict Network Access

```yaml
services:
  ollama:
    ports:
      - "127.0.0.1:11434:11434"  # Only local access
```

### Use Secrets

```yaml
services:
  backend:
    environment:
      - API_KEY_FILE=/run/secrets/api_key
    secrets:
      - api_key

secrets:
  api_key:
    file: ./secrets/api_key.txt
```

---

## 📦 Production Deployment

### Use Production Compose File

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    restart: always
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        limits:
          memory: 16G

  backend:
    image: proof-backend:latest
    restart: always
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 2G

  frontend:
    image: proof-frontend:latest
    restart: always
    deploy:
      replicas: 2

volumes:
  ollama_data:
```

Start with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Use Reverse Proxy

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
```

---

## 🎯 Next Steps

1. **Start Services**
   ```bash
   docker-compose up -d
   ```

2. **Wait for Ollama**
   ```bash
   docker-compose logs -f ollama
   ```

3. **Visit Application**
   Open http://localhost:3000

4. **Start Chatting**
   Chat naturally with the AI

5. **Watch Account Creation**
   See your account created automatically!

---

## 📞 Support

### Check Logs
```bash
docker-compose logs -f
```

### Verify Services
```bash
docker-compose ps
```

### Test Endpoints
```bash
curl http://localhost:3001/api/local-ai/status
```

### Restart Everything
```bash
docker-compose restart
```

---

## ✅ Checklist

- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Repository cloned
- [ ] `docker-compose up -d` executed
- [ ] Ollama model downloaded
- [ ] All services healthy
- [ ] http://localhost:3000 accessible
- [ ] Chat working
- [ ] Account creation working

---

**You're all set! Everything is running in Docker.** 🚀

For more information, see [DOCUMENTATION_MASTER.md](./DOCUMENTATION_MASTER.md)
