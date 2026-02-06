# Proof

A human-centric community platform with conversational authentication. No bots. No spam. No AI-generated noise. Just real conversations.

## Features

- **🤖 Bot Detection**: Conversational authentication ensures only real humans join communities
- **🔒 Privacy First**: Hosted in Europe, no tracking, no ads
- **🎨 Custom Avatars**: AI-generated avatars based on user descriptions
- **👥 Niche Communities**: Modding, free software, gaming, and more
- **🌍 Decentralized**: Built on open-source tools, can be self-hosted
- **📊 Transparent**: No algorithmic manipulation, chronological feeds

## Tech Stack

### Backend
- **Framework**: Node.js + Express
- **Database**: PostgreSQL
- **Authentication**: JWT
- **NLP**: Rasa (for conversational flows)
- **Image Generation**: Stable Diffusion (via Hugging Face)

### Frontend
- **Framework**: React 18
- **State Management**: Zustand
- **Styling**: CSS3
- **HTTP Client**: Axios

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Hosting**: Hetzner VPS (recommended)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if running without Docker)

### Setup with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/mateusbentes/proof.git
   cd proof
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start the stack**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Rasa: http://localhost:5005
   - PostgreSQL: localhost:5432

### Setup for Local Development

#### Backend

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up database**
   ```bash
   # Start PostgreSQL
   docker run -d \
     --name proof_postgres \
     -e POSTGRES_USER=proof_user \
     -e POSTGRES_PASSWORD=proof_password \
     -e POSTGRES_DB=proof_db \
     -p 5432:5432 \
     postgres:15-alpine

   # Run migrations
   npm run migrate
   ```

3. **Start Rasa**
   ```bash
   docker run -d \
     --name proof_rasa \
     -p 5005:5005 \
     -v $(pwd)/rasa:/app \
     rasa/rasa:3.5.0 \
     run --enable-api --cors "*"
   ```

4. **Start backend server**
   ```bash
   npm run dev
   ```

#### Frontend

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

## Project Structure

```
proof/
├── backend/
│   ├── src/
│   │   ├── index.js              # Entry point
│   │   ├── db/
│   │   │   ├── connection.js      # Database connection
│   │   │   └── init.sql           # Schema
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authentication
│   │   │   └── errorHandler.js    # Error handling
│   │   └── routes/
│   │       ├── auth.js            # Authentication endpoints
│   │       ├── users.js           # User profile endpoints
│   │       ├── communities.js      # Community endpoints
│   │       └── conversations.js    # Conversational auth endpoints
│   ├── rasa/
│   │   ├── config.yml             # Rasa configuration
│   │   ├── nlu.yml                # NLU training data
│   │   └── domain.yml             # Domain definition
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── index.js               # Entry point
│   │   ├── App.js                 # Main app component
│   │   ├── api/
│   │   │   └── client.js          # API client
│   │   ├── store/
│   │   │   └── authStore.js       # Auth state management
│   │   ├── components/
│   │   │   └── Navbar.js          # Navigation bar
│   │   └── pages/
│   │       ├── Home.js            # Home page
│   │       ├── Register.js        # Registration page
│   │       ├── Login.js           # Login page
│   │       ├── ConversationalAuth.js  # Auth conversation
│   │       ├── Communities.js     # Communities page
│   │       └── Profile.js         # User profile page
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Conversations
- `POST /api/conversations/start` - Start conversational auth
- `POST /api/conversations/message` - Send message in conversation
- `GET /api/conversations/:sessionId` - Get conversation details

### Users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId/profile` - Update user profile
- `POST /api/users/:userId/avatar` - Generate avatar

### Communities
- `GET /api/communities` - List all communities
- `POST /api/communities` - Create community
- `GET /api/communities/:slug` - Get community details
- `POST /api/communities/:communityId/join` - Join community
- `GET /api/communities/:communityId/members` - Get community members

## Conversational Authentication Flow

1. **Welcome**: User is asked why they want to join
2. **Experience**: User shares their experience with open-source/modding
3. **Avatar**: User describes their desired avatar
4. **Verification**: System analyzes responses for authenticity

### Bot Detection Scoring

The system calculates a bot score (0-1) based on:
- **NLU Confidence**: Low confidence in intent detection
- **Generic Phrases**: Detection of common bot responses
- **Message Length**: Very short messages
- **Word Count**: Insufficient detail

## Environment Variables

```env
# Backend
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/proof_db
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Rasa
RASA_URL=http://localhost:5005

# Frontend
REACT_APP_API_URL=http://localhost:3001/api

# Image Generation
HUGGINGFACE_API_KEY=your_api_key
STABLE_DIFFUSION_MODEL=runwayml/stable-diffusion-v1-5

# Moderation
BOT_DETECTION_THRESHOLD=0.7
GENERIC_RESPONSE_THRESHOLD=0.6
```

## Development

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Deployment

### Hetzner VPS Setup

1. **Create VPS** (CX11 or higher recommended)
2. **SSH into server**
   ```bash
   ssh root@your_vps_ip
   ```

3. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

4. **Clone repository**
   ```bash
   git clone https://github.com/mateusbentes/proof.git
   cd proof
   ```

5. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

6. **Start services**
   ```bash
   docker-compose up -d
   ```

7. **Set up reverse proxy** (Nginx)
   ```bash
   # Install Nginx
   apt-get install nginx

   # Configure reverse proxy
   # Point to localhost:3000 (frontend) and localhost:3001 (backend)
   ```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Roadmap

- [ ] Phase 1: MVP with conversational auth
- [ ] Phase 2: Community features (posts, comments, moderation)
- [ ] Phase 3: Decentralization (ATProto integration)
- [ ] Phase 4: Mobile apps (React Native)
- [ ] Phase 5: Advanced moderation tools

## Acknowledgments

- Built with [Rasa](https://rasa.com/) for NLP
- Avatar generation via [Hugging Face](https://huggingface.co/)
- Inspired by privacy-first communities like Lemmy and Bluesky
