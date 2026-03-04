#!/bin/bash
# Planthesia VPS Setup Script
# Run this on your VPS: bash setup.sh

set -e

echo "🌱 Setting up Planthesia on planthesia.in..."

# Install Node.js 20
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git

# Install PM2 + Nginx
echo "📦 Installing PM2 + Nginx..."
npm install -g pm2
apt install -y nginx
systemctl enable nginx

# Clone repo
echo "📥 Cloning repo..."
rm -rf /var/www/planthesia
git clone https://github.com/Chaitanyahoon/Planthesia.git /var/www/planthesia
cd /var/www/planthesia

# Create .env.local
echo "🔑 Creating .env.local..."
cat > /var/www/planthesia/.env.local << 'EOF'
GEMINI_API_KEY=AIzaSyBHrcgMRNwS7gKWVmIUcRj3k_kOvog4SGo
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC6wMAS_AmoYgFMkPDaQhD57-s-OpbNJHM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=planthesia.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=planthesia
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=planthesia.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=551863200948
NEXT_PUBLIC_FIREBASE_APP_ID=1:551863200948:web:5ef152c044d37933757be1
EOF

# Install deps and build
echo "🔨 Building..."
npm install
npm run build

# Start with PM2
echo "🚀 Starting with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

# Set up Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/planthesia << 'EOF'
server {
    listen 80;
    server_name planthesia.in www.planthesia.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/planthesia /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# SSL
echo "🔒 Installing SSL certificate..."
apt install -y certbot python3-certbot-nginx
certbot --nginx -d planthesia.in -d www.planthesia.in --non-interactive --agree-tos -m admin@planthesia.in

echo ""
echo "✅ Done! planthesia.in is live!"
echo "   Run: pm2 logs planthesia"
