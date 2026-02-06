# Proof - Setup Guide

Complete guide to set up and run the Proof platform locally or in production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start with Docker](#quick-start-with-docker)
3. [Local Development Setup](#local-development-setup)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required
- Docker & Docker Compose (for containerized setup)
- Git
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)

### Optional
- Hugging Face API key (for avatar generation)
- Rasa CLI (for NLU training)

## Quick Start with Docker

### 1. Clone the Repository

```bash
git clone https://github.com/mateusbentes/proof.git
cd proof
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` and update the following (optional):
```env
JWT_SECRET=your_secure_random_key_here
HUGGINGFACE_API_KEY=your_api_key_here
```

### 3. Start All Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Backend API (port 3001)
- Rasa NLU (port 5005)
- Frontend (port 3000)

### 4. Verify Services

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Test backend health
curl http://localhost:3001/health

# Test frontend
open http://localhost:3000
```

### 5. Seed Database (Optional)

```bash
docker-compose exec backend npm run seed
```

## Local Development Setup

### Backend Setup

#### 1. Install Dependencies

```bash
cd backend
npm install
```

#### 2. Start PostgreSQL

Option A: Using Docker
```bash
docker run -d \
  --name proof_postgres \
  -e POSTGRES_USER=proof_user \
  -e POSTGRES_PASSWORD=proof_password \
  -e POSTGRES_DB=proof_db \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

Option B: Using local PostgreSQL
```bash
# Create database
createdb -U postgres proof_db

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/proof_db
```

#### 3. Run Migrations

```bash
npm run migrate
```

#### 4. Start Rasa

```bash
docker run -d \
  --name proof_rasa \
  -p 5005:5005 \
  -v $(pwd)/rasa:/app \
  rasa/rasa:3.5.0 \
  run --enable-api --cors "*"
```

#### 5. Start Backend Server

```bash
npm run dev
```

The backend will be available at `http://localhost:3001`

### Frontend Setup

#### 1. Install Dependencies

```bash
cd frontend
npm install
```

#### 2. Create Environment File

```bash
# .env or .env.local
REACT_APP_API_URL=http://localhost:3001/api
```

#### 3. Start Development Server

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Database Setup

### Schema Overview

The database includes the following tables:

- **users**: User accounts and authentication
- **user_profiles**: User profile information
- **communities**: Community metadata
- **community_members**: Community membership
- **conversations**: Conversational authentication sessions
- **conversation_messages**: Messages in conversations
- **posts**: Community posts
- **comments**: Post comments
- **moderation_logs**: Moderation actions

### Manual Schema Creation

If not using Docker:

```bash
psql -U proof_user -d proof_db -f backend/db/init.sql
```

### Seeding Sample Data

```bash
cd backend
npm run seed
```

This creates:
- 2 sample users (mateus/alice)
- 2 sample communities (Mount & Blade Modding, Free Software)
- Sample community memberships

## Environment Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://proof_user:proof_password@localhost:5432/proof_db

# JWT
JWT_SECRET=your_very_secure_random_key_here_change_in_production
JWT_EXPIRY=7d

# Rasa
RASA_URL=http://localhost:5005

# Image Generation
HUGGINGFACE_API_KEY=hf_your_api_key_here
STABLE_DIFFUSION_MODEL=runwayml/stable-diffusion-v1-5

# Moderation
BOT_DETECTION_THRESHOLD=0.7
GENERIC_RESPONSE_THRESHOLD=0.6
```

### Frontend Environment Variables

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Running the Application

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Local Development

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

Terminal 3 - Rasa (if not using Docker):
```bash
cd backend/rasa
rasa run --enable-api --cors "*"
```

## Testing

### Backend Tests

```bash
cd backend
npm test
npm run test:watch
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:watch
```

### Manual Testing

1. **Register a new user**
   - Go to http://localhost:3000/register
   - Fill in username, email, password
   - Click "Create Account"

2. **Conversational Authentication**
   - Answer the three questions about your interests
   - System will analyze your responses for authenticity

3. **Create a Community**
   - Log in
   - Go to Communities
   - Click "Create Community"
   - Fill in details and submit

4. **Join a Community**
   - Browse communities
   - Click "Join Community"

5. **Update Profile**
   - Go to Profile
   - Click "Edit Profile"
   - Update information and generate avatar

## Troubleshooting

### Database Connection Issues

**Error**: `connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running, start it
docker run -d \
  --name proof_postgres \
  -e POSTGRES_USER=proof_user \
  -e POSTGRES_PASSWORD=proof_password \
  -e POSTGRES_DB=proof_db \
  -p 5432:5432 \
  postgres:15-alpine
```

### Rasa Connection Issues

**Error**: `Failed to connect to Rasa at http://localhost:5005`

**Solution**:
```bash
# Check if Rasa is running
docker ps | grep rasa

# If not running, start it
docker run -d \
  --name proof_rasa \
  -p 5005:5005 \
  -v $(pwd)/backend/rasa:/app \
  rasa/rasa:3.5.0 \
  run --enable-api --cors "*"
```

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 npm start
```

### Docker Compose Issues

**Error**: `docker: command not found`

**Solution**:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Frontend Not Loading

**Error**: `Cannot GET /`

**Solution**:
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### API Requests Failing

**Error**: `CORS error` or `401 Unauthorized`

**Solution**:
1. Check backend is running: `curl http://localhost:3001/health`
2. Verify JWT token is being sent in requests
3. Check `REACT_APP_API_URL` in frontend `.env`

## Next Steps

1. **Customize**: Update branding, colors, and content
2. **Deploy**: Follow deployment guide for Hetzner VPS
3. **Extend**: Add more communities, features, and moderation tools
4. **Monitor**: Set up logging and monitoring for production

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review logs: `docker-compose logs -f`
3. Open an issue on GitHub
4. Check existing issues for solutions

## Additional Resources

- [Rasa Documentation](https://rasa.com/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
