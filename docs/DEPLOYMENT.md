# 🚀 Deployment Guide

This guide covers deploying the `auto-short-factory` to a production Linux server (Ubuntu 22.04+).

## 📋 Prerequisites

*   **Server**: VPS with at least 2 CPU / 4GB RAM (FFmpeg is heavy).
*   **Domain**: Pointed to your server IP.
*   **Tools**: Git, Docker, Docker Compose (Recommended) OR Node.js/Python/FFmpeg (Manual).

---

## 🐳 Method 1: Docker Compose (Recommended)

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/your-repo/auto-short-factory.git
    cd auto-short-factory
    ```

2.  **Configure Environment**:
    ```bash
    cp .env.example .env.production
    nano .env.production
    # Fill in API keys, Database URL, S3 credentials
    ```

3.  **Build and Run**:
    ```bash
    docker-compose up -d --build
    ```

    *This starts Postgres, Redis, Orchestrator, AI Service, and Video Engine in coordinated containers.*

---

## 🛠️ Method 2: Manual (PM2)

If you prefer running on bare metal for performance.

### 1. Install System Dependencies
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python 3.11
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt-get install -y python3.11 python3.11-venv

# FFmpeg
sudo apt-get install -y ffmpeg

# PM2 & PNPM
sudo npm install -g pnpm pm2
```

### 2. Install Project Dependencies
```bash
pnpm install
pnpm run build
```

### 3. Setup Python Virtualenvs
```bash
# AI Logic
cd apps/ai-logic
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Video Engine
cd ../video-engine
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
```

### 4. Start with PM2
Create an `ecosystem.config.js` in root:

```javascript
module.exports = {
  apps: [
    {
      name: "orchestrator",
      script: "apps/orchestrator/dist/index.js",
      env: { NODE_ENV: "production" }
    },
    {
      name: "ai-logic",
      script: "apps/ai-logic/src/main.py",
      interpreter: "apps/ai-logic/venv/bin/python"
    },
    {
      name: "video-engine",
      script: "apps/video-engine/src/main.py",
      interpreter: "apps/video-engine/venv/bin/python"
    }
  ]
}
```

Run:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔒 Security Checklist

1.  **Firewall**: UFW allow 22 (SSH), 80/443 (HTTP), deny 5432 (DB).
2.  **Reverse Proxy**: Use Nginx to expose the Dashboard/API, don't expose Node ports (3000/8000) directly.
3.  **SSL**: Use Certbot for HTTPS.
