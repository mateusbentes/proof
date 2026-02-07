# 🚀 Open-Source AI Setup Guide

Complete guide to running Proof with **open-source AI models** instead of OpenAI.

## 🌟 What You Get

- **No API costs** - Run AI locally
- **No vendor lock-in** - Use open-source models
- **Full privacy** - All data stays on your server
- **Complete control** - Customize everything
- **Self-hosted** - Own your infrastructure

## 📋 Prerequisites

- Docker (recommended) or local installation
- 8GB+ RAM (16GB+ recommended)
- 20GB+ disk space for models
- Linux, macOS, or Windows with WSL2

## 🚀 Quick Start (Docker)

### 1. Install Docker

```bash
# macOS
brew install docker

# Ubuntu/Debian
sudo apt-get install docker.io

# Windows
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
```

### 2. Run Ollama with Docker

```bash
# Pull and run Ollama
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  ollama/ollama

# Wait for it to start
sleep 5

# Pull a model (choose one)
docker exec ollama ollama pull mistral
# or
docker exec ollama ollama pull llama2
# or
docker exec ollama ollama pull neural-chat
```

### 3. Verify Ollama is Running

```bash
curl http://localhost:11434/api/tags
```

You should see a JSON response with available models.

## 🖥️ Local Installation (Without Docker)

### macOS

```bash
# Install Ollama
brew install ollama

# Start Ollama service
ollama serve

# In another terminal, pull a model
ollama pull mistral
```

### Ubuntu/Debian

```bash
# Download and install
curl https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# In another terminal, pull a model
ollama pull mistral
```

### Windows

1. Download from https://ollama.ai/download
2. Install and run
3. Open PowerShell and run:
```powershell
ollama pull mistral
```

## 🤖 Available Models

### Mistral (Recommended)
```bash
ollama pull mistral
```
- **Size**: 4.1GB
- **Speed**: Fast
- **Quality**: Excellent
- **Best for**: Conversational AI
- **RAM needed**: 8GB

### Llama 2
```bash
ollama pull llama2
```
- **Size**: 3.8GB
- **Speed**: Fast
- **Quality**: Very Good
- **Best for**: General purpose
- **RAM needed**: 8GB

### Neural Chat
```bash
ollama pull neural-chat
```
- **Size**: 4.1GB
- **Speed**: Fast
- **Quality**: Excellent
- **Best for**: Conversational AI
- **RAM needed**: 8GB

### Dolphin Mixtral
```bash
ollama pull dolphin-mixtral
```
- **Size**: 26GB
- **Speed**: Slower
- **Quality**: Excellent
- **Best for**: Complex tasks
- **RAM needed**: 16GB+

## 🔧 Configuration

### Environment Variables

Create `.env` file in backend directory:

```bash
# Ollama Configuration
OLLAMA_API_URL=http://localhost:11434/api
OLLAMA_MODEL=mistral

# Or use other models:
# OLLAMA_MODEL=llama2
# OLLAMA_MODEL=neural-chat
# OLLAMA_MODEL=dolphin-mixtral

# API Configuration
API_URL=http://localhost:3001/api
NODE_ENV=development
```

### Backend Setup

```bash
# Install dependencies
cd backend
npm install

# Start backend
npm run dev
```

### Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start frontend
npm start
```

## 🧪 Testing

### Check Ollama Status

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Expected response:
# {
#   "models": [
#     {
#       "name": "mistral:latest",
#       "modified_at": "2024-02-06T...",
#       "size": 4109232960,
#       "digest": "..."
#     }
#   ]
# }
```

### Test API Endpoint

```bash
# Check local AI status
curl http://localhost:3001/api/local-ai/status

# Expected response:
# {
#   "running": true,
#   "models": [
#     {
#       "name": "mistral:latest",
#       "size": 4109232960,
#       "digest": "..."
#     }
#   ],
#   "currentModel": "mistral"
# }
```

### Test Conversation

```bash
curl -X POST http://localhost:3001/api/local-ai/continue-conversation \
  -H "Content-Type: application/json" \
  -d '{
    "conversationHistory": [
      {
        "role": "user",
        "content": "Tell me about yourself"
      }
    ],
    "messageCount": 1
  }'
```

## 📊 Performance Tuning

### Increase Model Context

Edit Ollama configuration to increase context window:

```bash
# For Mistral (default 2048)
OLLAMA_NUM_THREAD=8 ollama run mistral
```

### GPU Acceleration

If you have NVIDIA GPU:

```bash
# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker

# Run Ollama with GPU
docker run -d \
  --name ollama \
  --gpus all \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  ollama/ollama
```

### Memory Management

```bash
# Limit memory usage
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -m 8g \
  -v ollama:/root/.ollama \
  ollama/ollama
```

## 🔄 Model Management

### List Models

```bash
ollama list
# or
curl http://localhost:11434/api/tags
```

### Pull New Model

```bash
ollama pull llama2
# or via API
curl -X POST http://localhost:11434/api/pull \
  -d '{"name": "llama2"}'
```

### Remove Model

```bash
ollama rm mistral
# or via API
curl -X DELETE http://localhost:11434/api/delete \
  -d '{"name": "mistral"}'
```

### Show Model Details

```bash
ollama show mistral
```

## 🐛 Troubleshooting

### Ollama Not Running

```bash
# Check if service is running
ps aux | grep ollama

# Start Ollama
ollama serve

# Or with Docker
docker start ollama
```

### Out of Memory

```bash
# Reduce model size
ollama pull mistral:7b-q4_0  # Quantized version

# Or increase system memory
# Allocate more RAM to Docker
```

### Slow Responses

```bash
# Check system resources
top
free -h

# Reduce context window
# Edit model parameters

# Use quantized model
ollama pull mistral:7b-q4_0
```

### Connection Refused

```bash
# Check if Ollama is listening
netstat -an | grep 11434

# Check firewall
sudo ufw allow 11434

# Verify OLLAMA_API_URL in .env
OLLAMA_API_URL=http://localhost:11434/api
```

## 📈 Scaling

### Multiple Models

```bash
# Run different models for different tasks
docker run -d --name ollama-mistral -p 11434:11434 ollama/ollama
docker run -d --name ollama-llama -p 11435:11435 ollama/ollama

# Configure backend to use different models
OLLAMA_API_URL=http://localhost:11434/api
OLLAMA_MODEL=mistral
```

### Load Balancing

```bash
# Use nginx to load balance between multiple Ollama instances
upstream ollama {
  server localhost:11434;
  server localhost:11435;
  server localhost:11436;
}

server {
  listen 11434;
  location / {
    proxy_pass http://ollama;
  }
}
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      containers:
      - name: ollama
        image: ollama/ollama:latest
        ports:
        - containerPort: 11434
        resources:
          requests:
            memory: "8Gi"
            cpu: "4"
          limits:
            memory: "16Gi"
            cpu: "8"
        volumeMounts:
        - name: ollama-data
          mountPath: /root/.ollama
      volumes:
      - name: ollama-data
        persistentVolumeClaim:
          claimName: ollama-pvc
```

## 🔒 Security

### Firewall Configuration

```bash
# Allow only local access
sudo ufw allow from 127.0.0.1 to any port 11434

# Or allow from specific IP
sudo ufw allow from 192.168.1.100 to any port 11434
```

### Reverse Proxy with Authentication

```nginx
server {
  listen 11434;
  
  auth_basic "Ollama API";
  auth_basic_user_file /etc/nginx/.htpasswd;
  
  location / {
    proxy_pass http://localhost:11435;
  }
}
```

### SSL/TLS

```nginx
server {
  listen 11434 ssl;
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  
  location / {
    proxy_pass http://localhost:11435;
  }
}
```

## 📚 API Reference

### Generate Response

```bash
curl -X POST http://localhost:11434/api/generate \
  -d '{
    "model": "mistral",
    "prompt": "Why is the sky blue?",
    "stream": false
  }'
```

### List Models

```bash
curl http://localhost:11434/api/tags
```

### Pull Model

```bash
curl -X POST http://localhost:11434/api/pull \
  -d '{"name": "llama2"}'
```

### Delete Model

```bash
curl -X DELETE http://localhost:11434/api/delete \
  -d '{"name": "mistral"}'
```

## 🎯 Best Practices

1. **Use Quantized Models** - Smaller, faster, less memory
2. **Monitor Resources** - Watch CPU, RAM, disk usage
3. **Cache Responses** - Store common responses
4. **Rate Limit** - Prevent abuse
5. **Update Models** - Keep models current
6. **Backup Data** - Regular backups of model data
7. **Monitor Performance** - Track response times
8. **Use GPU** - If available, enable GPU acceleration

## 🚀 Production Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_NUM_THREAD=8
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - OLLAMA_API_URL=http://ollama:11434/api
      - OLLAMA_MODEL=mistral
    depends_on:
      - ollama
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:3001/api
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  ollama_data:
```

### Start Everything

```bash
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

## 📊 Monitoring

### Check Resource Usage

```bash
# Docker
docker stats ollama

# System
top
free -h
df -h
```

### Monitor Response Times

```bash
# Add timing to requests
time curl -X POST http://localhost:11434/api/generate \
  -d '{"model": "mistral", "prompt": "Hello", "stream": false}'
```

## 🔄 Updates

### Update Ollama

```bash
# Docker
docker pull ollama/ollama:latest
docker-compose up -d

# Local
brew upgrade ollama
```

### Update Models

```bash
# Pull latest version
ollama pull mistral

# Or specific version
ollama pull mistral:7b-q4_0
```

## 📞 Support

- **Ollama Docs**: https://github.com/ollama/ollama
- **Model Library**: https://ollama.ai/library
- **Issues**: https://github.com/ollama/ollama/issues

## ✅ Checklist

- [ ] Ollama installed and running
- [ ] Model pulled (mistral, llama2, or neural-chat)
- [ ] Environment variables configured
- [ ] Backend running
- [ ] Frontend running
- [ ] API endpoints tested
- [ ] Conversation working
- [ ] Account creation working
- [ ] Performance acceptable
- [ ] Monitoring in place

---

**You now have a fully self-hosted, open-source AI system with zero API costs!** 🚀
