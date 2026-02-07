# Docker Troubleshooting Guide

## Issue: Backend Container Unhealthy

### Symptoms
```
ERROR: for backend  Container "xxx" is unhealthy.
Encountered errors while bringing up the project.
```

### Root Causes
1. **Network recreation errors** - Docker network configuration conflicts
2. **Health check failures** - Backend not responding to health checks
3. **Dependency timing** - Services not ready when backend starts

### Solutions

### Solution 1: Complete Reset (Recommended)

```bash
# Stop all containers
docker-compose down -v

# Remove all Docker networks
docker network prune -f

# Remove all unused Docker data
docker system prune -f

# Rebuild images
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

### Solution 2: Start Services Individually

```bash
# Start dependencies first
docker-compose up -d redis postgres

# Wait for them to be healthy
sleep 30

# Start Rasa and Ollama
docker-compose up -d rasa ollama

# Wait for them
sleep 30

# Start backend
docker-compose up -d backend

# Start frontend
docker-compose up -d frontend

# Check status
docker-compose ps
```

### Solution 3: Disable Health Checks (Temporary)

If health checks are causing issues, temporarily disable them:

```yaml
# In docker-compose.yml, remove or comment out:
# healthcheck:
#   test: ["CMD", "curl", "-f", "http://localhost:3001/api/local-ai/status"]
#   interval: 30s
#   timeout: 10s
#   retries: 3
#   start_period: 40s
```

Then start:
```bash
docker-compose up -d
```

### Solution 4: Check Backend Logs

```bash
# View backend logs
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f backend

# View specific service
docker-compose logs postgres
docker-compose logs redis
docker-compose logs rasa
```

### Solution 5: Verify Network

```bash
# List Docker networks
docker network ls

# Inspect proof network
docker network inspect proof_default

# Check if services can communicate
docker-compose exec backend ping redis
docker-compose exec backend ping postgres
```

## Common Issues & Fixes

### Issue: "Network needs to be recreated"

**Fix:**
```bash
docker-compose down
docker network rm proof_default
docker-compose up -d
```

### Issue: "Port already in use"

**Fix:**
```bash
# Find process using port
lsof -i :3001
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Issue: "Out of memory"

**Fix:**
```bash
# Check Docker memory
docker stats

# Increase Docker memory limit in Docker Desktop settings
# Or reduce Ollama model size
```

### Issue: "Database connection refused"

**Fix:**
```bash
# Check PostgreSQL is running
docker-compose logs postgres

# Verify connection
docker-compose exec postgres psql -U proof -d proof_db -c "SELECT 1"

# Reset database
docker-compose down -v
docker-compose up -d postgres
sleep 30
docker-compose up -d
```

### Issue: "Rasa not responding"

**Fix:**
```bash
# Check Rasa logs
docker-compose logs rasa

# Verify Rasa is running
curl http://localhost:5005/

# Restart Rasa
docker-compose restart rasa
```

### Issue: "Ollama not responding"

**Fix:**
```bash
# Check Ollama logs
docker-compose logs ollama

# Verify Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
docker-compose restart ollama

# Note: Ollama takes time to start (1-2 minutes)
```

## Verification Checklist

After starting, verify all services:

```bash
# Check all containers running
docker-compose ps

# Expected output:
# proof-redis      Up (healthy)
# proof-postgres   Up (healthy)
# proof-rasa       Up (healthy)
# proof-ollama     Up (healthy)
# proof-backend    Up
# proof-frontend   Up

# Test each service
curl http://localhost:3000      # Frontend
curl http://localhost:3001/health  # Backend
curl http://localhost:5005/      # Rasa
curl http://localhost:11434/api/tags  # Ollama
redis-cli -h localhost ping      # Redis
psql -h localhost -U proof -d proof_db -c "SELECT 1"  # PostgreSQL
```

## Quick Commands

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Rebuild images
docker-compose build --no-cache

# Clean everything
docker-compose down -v
docker system prune -af

# Check status
docker-compose ps

# Execute command in container
docker-compose exec backend npm start
```

## Performance Tips

1. **Increase Docker memory** - Ollama needs 4GB+
2. **Use smaller AI models** - mistral:7b-q4_0 instead of full models
3. **Enable GPU** - If available, use GPU acceleration
4. **Reduce Ollama threads** - Set OLLAMA_NUM_THREAD=4 if memory constrained

## Still Having Issues?

1. Check Docker version: `docker --version`
2. Check docker-compose version: `docker-compose --version`
3. Check system resources: `docker stats`
4. Review logs: `docker-compose logs`
5. Try complete reset: `docker-compose down -v && docker system prune -af`

---

**If issues persist, try the complete reset solution above.**
