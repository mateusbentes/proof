# Proof - Quick Start (5 minutes)

Get Proof running in 5 minutes with Docker.

## Prerequisites

- Docker & Docker Compose installed
- Git

## Steps

### 1. Clone & Setup (1 min)

```bash
git clone https://github.com/mateusbentes/proof.git
cd proof
cp .env.example .env
```

### 2. Start Services (2 min)

```bash
docker-compose up -d
```

Wait for all services to be healthy:
```bash
docker-compose ps
```

### 3. Access Application (1 min)

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Rasa**: http://localhost:5005

### 4. Test It (1 min)

1. Go to http://localhost:3000
2. Click "Get Started"
3. Register with:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
4. Answer the conversational questions
5. Create your avatar
6. Explore communities!

## Common Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Seed sample data
docker-compose exec backend npm run seed

# Access database
docker-compose exec postgres psql -U proof_user -d proof_db
```

## Troubleshooting

**Services won't start?**
```bash
docker-compose down -v
docker-compose up -d
```

**Port already in use?**
```bash
# Change ports in docker-compose.yml or kill process
lsof -i :3000
kill -9 <PID>
```

**Database issues?**
```bash
docker-compose exec backend npm run migrate
```

## Next Steps

- Read [SETUP.md](SETUP.md) for detailed configuration
- Read [README.md](README.md) for full documentation
- Check [backend/package.json](backend/package.json) for available scripts
- Explore the codebase in `backend/src` and `frontend/src`

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│                   http://localhost:3000                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (Node.js)                       │
│                   http://localhost:3001                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Routes: Auth, Users, Communities, Conversations │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   ┌─────────┐    ┌──────────┐    ┌──────────┐
   │PostgreSQL│    │   Rasa   │    │Hugging   │
   │Database  │    │   NLU    │    │Face API  │
   └─────────┘    └──────────┘    └──────────┘
```

## Features Checklist

- ✅ User registration & login
- ✅ Conversational authentication
- ✅ Bot detection scoring
- ✅ Avatar generation
- ✅ Community creation & management
- ✅ User profiles
- ✅ JWT authentication
- ✅ PostgreSQL database
- ✅ Rasa NLU integration
- ✅ Docker containerization

## What's Next?

1. **Customize**: Update colors, branding, and content
2. **Extend**: Add posts, comments, and moderation features
3. **Deploy**: Push to Hetzner VPS or your preferred host
4. **Monitor**: Set up logging and error tracking
5. **Scale**: Add caching, CDN, and load balancing

## Support

- 📖 [Full Documentation](README.md)
- 🔧 [Setup Guide](SETUP.md)
- 🐛 [Report Issues](https://github.com/mateusbentes/proof/issues)
- 💬 [Discussions](https://github.com/mateusbentes/proof/discussions)

---

**Happy building! 🚀**
