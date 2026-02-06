# Proof - Deployment Guide

Complete guide to deploy Proof to production on Hetzner VPS or other cloud providers.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Hetzner VPS Setup](#hetzner-vps-setup)
3. [Server Configuration](#server-configuration)
4. [Application Deployment](#application-deployment)
5. [SSL/TLS Setup](#ssltls-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Backup & Recovery](#backup--recovery)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required
- Hetzner account (or other VPS provider)
- Domain name
- SSH client
- Git
- Basic Linux knowledge

### Recommended
- Monitoring tools (Prometheus, Grafana)
- Log aggregation (ELK Stack)
- Backup service (Backblaze, AWS S3)

## Hetzner VPS Setup

### 1. Create VPS Instance

1. Log in to Hetzner Cloud Console
2. Create new server:
   - **Image**: Ubuntu 24.04 LTS
   - **Type**: CX21 or higher (2 vCPU, 4GB RAM minimum)
   - **Location**: Choose closest to your users
   - **SSH Key**: Add your public key
3. Note the IP address

### 2. Initial Server Setup

```bash
# SSH into server
ssh root@your_vps_ip

# Update system
apt-get update
apt-get upgrade -y

# Install essential tools
apt-get install -y \
  curl \
  wget \
  git \
  htop \
  vim \
  ufw \
  fail2ban

# Set timezone
timedatectl set-timezone UTC
```

### 3. Configure Firewall

```bash
# Enable UFW
ufw enable

# Allow SSH
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Verify rules
ufw status
```

### 4. Create Non-Root User

```bash
# Create user
adduser proof

# Add to sudo group
usermod -aG sudo proof

# Switch to new user
su - proof

# Add SSH key for new user
mkdir -p ~/.ssh
# Copy your public key to ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## Server Configuration

### 1. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker proof

# Verify installation
docker --version
docker-compose --version
```

### 2. Install Docker Compose

```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

### 3. Install Nginx

```bash
# Install Nginx
sudo apt-get install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

### 4. Install Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Verify
certbot --version
```

## Application Deployment

### 1. Clone Repository

```bash
# Clone repository
cd /home/proof
git clone https://github.com/mateusbentes/proof.git
cd proof

# Create .env file
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` with production values:

```bash
nano .env
```

```env
# Server
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://proof_user:strong_password@postgres:5432/proof_db

# JWT
JWT_SECRET=generate_strong_random_key_here
JWT_EXPIRY=7d

# Rasa
RASA_URL=http://rasa:5005

# Image Generation
HUGGINGFACE_API_KEY=your_api_key_here

# Moderation
BOT_DETECTION_THRESHOLD=0.7
GENERIC_RESPONSE_THRESHOLD=0.6
```

### 3. Update Docker Compose

Edit `docker-compose.yml` for production:

```yaml
# Change frontend port to internal only
frontend:
  ports:
    - "3000:3000"  # Keep for Nginx reverse proxy

# Add restart policies
services:
  postgres:
    restart: always
  backend:
    restart: always
  rasa:
    restart: always
  frontend:
    restart: always
```

### 4. Start Services

```bash
# Start all services
docker-compose up -d

# Verify services
docker-compose ps

# Check logs
docker-compose logs -f
```

### 5. Initialize Database

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed sample data (optional)
docker-compose exec backend npm run seed
```

## SSL/TLS Setup

### 1. Configure Nginx

Create `/etc/nginx/sites-available/proof`:

```nginx
upstream backend {
    server localhost:3001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your_domain.com www.your_domain.com;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Rasa
    location /rasa/ {
        proxy_pass http://localhost:5005/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### 2. Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/proof /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3. Get SSL Certificate

```bash
# Get certificate
sudo certbot certonly --nginx -d your_domain.com -d www.your_domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

## Monitoring & Maintenance

### 1. Monitor Services

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Monitor resources
docker stats
```

### 2. Database Maintenance

```bash
# Connect to database
docker-compose exec postgres psql -U proof_user -d proof_db

# Useful commands
\dt                    # List tables
\di                    # List indexes
SELECT COUNT(*) FROM users;  # Count users
```

### 3. Backup Database

```bash
# Create backup script
cat > /home/proof/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/proof/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/proof_db_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

docker-compose exec -T postgres pg_dump -U proof_user proof_db > $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "proof_db_*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

chmod +x /home/proof/backup.sh

# Schedule daily backup
(crontab -l 2>/dev/null; echo "0 2 * * * /home/proof/backup.sh") | crontab -
```

### 4. Monitor Disk Space

```bash
# Check disk usage
df -h

# Check Docker volumes
docker volume ls
docker volume inspect proof_postgres_data

# Clean up old images
docker image prune -a
```

## Backup & Recovery

### 1. Automated Backups

```bash
# Backup to S3 (optional)
apt-get install -y awscli

# Configure AWS credentials
aws configure

# Create backup script with S3 upload
cat > /home/proof/backup-s3.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/proof/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/proof_db_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

docker-compose exec -T postgres pg_dump -U proof_user proof_db > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://your-bucket/proof-backups/

# Keep local backups for 7 days
find $BACKUP_DIR -name "proof_db_*.sql" -mtime +7 -delete

echo "Backup completed and uploaded: $BACKUP_FILE"
EOF

chmod +x /home/proof/backup-s3.sh
```

### 2. Recovery Procedure

```bash
# List available backups
ls -la /home/proof/backups/

# Restore from backup
docker-compose exec -T postgres psql -U proof_user proof_db < /home/proof/backups/proof_db_TIMESTAMP.sql

# Verify restoration
docker-compose exec postgres psql -U proof_user -d proof_db -c "SELECT COUNT(*) FROM users;"
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild containers
docker-compose down
docker-compose up -d
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U proof_user -d proof_db -c "SELECT 1;"

# Check environment variables
docker-compose exec backend env | grep DATABASE_URL
```

### High Memory Usage

```bash
# Check memory usage
docker stats

# Limit container memory
# Edit docker-compose.yml and add:
# deploy:
#   resources:
#     limits:
#       memory: 512M

docker-compose up -d
```

### SSL Certificate Issues

```bash
# Check certificate expiration
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --force-renewal

# Check Nginx SSL configuration
sudo nginx -t
```

### Nginx Not Proxying Correctly

```bash
# Check Nginx configuration
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Reload Nginx
sudo systemctl reload nginx
```

## Performance Optimization

### 1. Enable Caching

```bash
# Add to docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  restart: always
```

### 2. Database Optimization

```bash
# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users;

# Vacuum database
VACUUM ANALYZE;
```

### 3. Nginx Caching

```nginx
# Add to Nginx configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 10m;
    proxy_pass http://frontend;
}
```

## Monitoring Setup

### 1. Install Prometheus

```bash
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  restart: always
```

### 2. Install Grafana

```bash
# Add to docker-compose.yml
grafana:
  image: grafana/grafana:latest
  ports:
    - "3002:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
  restart: always
```

## Maintenance Schedule

### Daily
- Monitor error logs
- Check disk space
- Monitor CPU/memory usage

### Weekly
- Review user registrations
- Check bot detection accuracy
- Review moderation logs

### Monthly
- Database optimization (VACUUM ANALYZE)
- Update Docker images
- Review security logs
- Backup verification

### Quarterly
- Security audit
- Performance review
- Capacity planning
- Update dependencies

## Support & Monitoring

### Useful Commands

```bash
# View all logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Execute command in container
docker-compose exec backend npm run migrate

# View resource usage
docker stats

# Check network
docker network ls
docker network inspect proof_default
```

### Monitoring Tools

- **Hetzner Cloud Console**: Server metrics
- **Nginx**: Access and error logs
- **Docker**: Container logs and stats
- **PostgreSQL**: Query logs and performance

## Conclusion

Your Proof instance is now deployed and running in production! 

### Next Steps
1. Monitor the application
2. Gather user feedback
3. Optimize performance
4. Plan feature releases
5. Scale as needed

For issues or questions, check the logs and troubleshooting section above.

---

**Happy deploying!** 🚀
