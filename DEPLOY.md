# Planthesia — Hostinger VPS Deployment Guide
**Domain:** `planthesia.in` · **VPS IP:** `2.57.91.91`

---

## Prerequisites
- GitHub repo with your code pushed
- Hostinger VPS (KVM 1+) with Ubuntu 22.04
- DNS already configured: `planthesia.in` → `2.57.91.91` ✅

---

## Step 1 — Push to GitHub (Local)

```bash
git add .
git commit -m "feat: Firebase auth + Firestore + Zustand"
git push origin main
```

---

## Step 2 — SSH Into VPS

```bash
ssh root@2.57.91.91
```

---

## Step 3 — Install Node.js 20 + PM2 + Nginx (One-Time)

```bash
apt install git -y

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

npm install -g pm2
sudo apt install nginx -y && sudo systemctl enable nginx
```

---

## Step 4 — Clone Repo + Build

```bash
git clone https://github.com/YOUR_USERNAME/planthesia.git /var/www/planthesia
cd /var/www/planthesia

npm install
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Run the command it prints
```

Test: Open `http://2.57.91.91:3000` — Planthesia should load.

---

## Step 5 — Nginx Config

```bash
sudo nano /etc/nginx/sites-available/planthesia
```

Paste:

```nginx
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
```

```bash
sudo ln -s /etc/nginx/sites-available/planthesia /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 6 — Free HTTPS (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d planthesia.in -d www.planthesia.in
```

Follow the prompts. Auto-renews every 90 days. 🔒

---

## Updating the App (Future Deploys)

```bash
cd /var/www/planthesia
git pull
npm run build && pm2 restart planthesia
```

---

## Useful PM2 Commands

```bash
pm2 list
pm2 logs planthesia
pm2 restart planthesia
pm2 stop planthesia
```
