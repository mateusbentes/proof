# Proof - AI-Powered Community Platform

A revolutionary social network with AI-powered conversational onboarding. No passwords, no forms, just chat.

## 🚀 Quick Start (3 Steps)

```bash
# 1. Install Docker
brew install docker

# 2. Start Everything
docker-compose up -d

# 3. Visit http://localhost:3000
```

**That's it!** All 6 services start automatically:
- Redis (cache)
- PostgreSQL (database)
- Rasa (conversational AI)
- Ollama (local AI models)
- Backend (Node.js API)
- Frontend (React app)

## ✨ Features

- **AI Conversational Onboarding** - No passwords, no forms, just chat
- **Open-Source AI** - Mistral, Llama2, Neural-Chat models
- **Zero API Costs** - All AI runs locally
- **Full Privacy** - All data stays on your server
- **Auto-Profile Creation** - AI extracts personality and interests
- **Community Features** - Join communities, create posts, upvote content

## 📊 Stack

| Service | Port | Purpose |
|---------|------|---------|
| Redis | 6379 | Cache & sessions |
| PostgreSQL | 5432 | Database |
| Rasa | 5005 | Conversational AI |
| Ollama | 11434 | Local AI models |
| Backend | 3001 | Node.js API |
| Frontend | 3000 | React app |

## 🎯 How It Works

1. **User visits home** → Chat interface loads
2. **User chats naturally** → "I'm a developer passionate about open-source"
3. **AI analyzes** → Extracts personality, interests, background
4. **Account auto-created** → No passwords, no forms
5. **User explores** → Ready to join communities

## 🔧 Configuration

### Change AI Model
Edit `docker-compose.yml`:
```yaml
OLLAMA_MODEL=llama2  # or neural-chat
```

### Change Ports
Edit `docker-compose.yml`:
```yaml
ports:
  - "3002:3001"  # Backend on 3002
```

### Enable GPU
Edit `docker-compose.yml`:
```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

## 🎯 Common Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart
docker-compose restart

# Clean up
docker-compose down -v
```

## 🗄️ Database

### Connect to PostgreSQL
```bash
# Docker
docker-compose exec postgres psql -U proof -d proof_db

# Local
psql -h localhost -U proof -d proof_db
```

### Database Commands
```bash
# Backup
docker-compose exec postgres pg_dump -U proof proof_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U proof proof_db < backup.sql

# Reset
docker-compose down -v
docker-compose up -d
```

## 🚀 Services

### Redis
```bash
docker-compose exec redis redis-cli
docker-compose exec redis redis-cli PING
```

### Rasa
```bash
curl http://localhost:5005/
docker-compose exec rasa rasa shell
```

### Ollama
```bash
curl http://localhost:11434/api/tags
```

### Backend
```bash
curl http://localhost:3001/api/local-ai/status
```

## 🐛 Troubleshooting

### Services won't start
```bash
docker-compose logs
docker-compose build --no-cache
docker-compose up -d
```

### Out of memory
```bash
docker stats
# Increase Docker memory or use smaller model
```

### Database connection error
```bash
docker-compose exec backend psql -h postgres -U proof -d proof_db -c "SELECT 1"
```

### Service not responding
```bash
docker-compose logs <service-name>
docker-compose restart <service-name>
```

## 📈 Performance

- **Startup time**: 2-3 minutes
- **Response time**: 2-5 seconds
- **RAM needed**: 9GB
- **Disk needed**: 4.1GB (Ollama model)

## 💰 Cost

- **OpenAI API**: $0.01-0.10 per signup
- **Open-Source AI**: $0 per signup (100% savings!)

## 🔒 Security

- All data stays local
- No cloud transmission
- GDPR compliant
- User-controlled

## 📞 Support

- **Ollama**: https://github.com/ollama/ollama
- **Models**: https://ollama.ai/library
- **Rasa**: https://rasa.com

## 📱 Mobile Apps

Native applications for iOS and Android:

- **Android App** (Kotlin) - MIT License
- **iOS App** (Swift) - MIT License

See [MOBILE_APPS.md](./MOBILE_APPS.md) for development guide.

## 📄 License

Dual Licensed:
- **Client Code** (Frontend, Android, iOS): MIT License
- **Server Code** (Backend): Apache 2.0 License

This dual-licensing approach, similar to Bluesky, allows:
- ✅ Freedom to fork and modify
- ✅ Commercial use permitted
- ✅ Community contributions encouraged
- ✅ Clear attribution requirements
- ✅ Patent protection (Apache 2.0)

---

**Welcome to the future of social networks. 100% Open-Source.** 🚀
