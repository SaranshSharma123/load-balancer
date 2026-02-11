<![CDATA[<div align="center">

# ⚡ Layer 7 Load Balancer

### Production-Grade Node.js Reverse Proxy with Real-Time Monitoring Dashboard

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

A high-performance Layer 7 (HTTP) load balancer built from scratch with Node.js. Features active health monitoring, multiple load-balancing algorithms, and a stunning real-time dashboard powered by React and Socket.io.

</div>

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Dashboard](#-dashboard)
- [Deployment on AWS](#-deployment-on-aws)
- [Why Not Vercel / Serverless?](#-why-not-vercel--serverless)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔀 **Round-Robin** | Distributes requests evenly across healthy backends in circular order |
| 📉 **Least Connections** | Routes traffic to the backend with the fewest active connections |
| 🏥 **Active Health Checks** | Pings each backend every 10 seconds; marks unhealthy after 3 consecutive failures |
| 📊 **Real-Time Dashboard** | Beautiful React UI with live metrics via Socket.io |
| 🔌 **Backend Toggle** | Enable/disable any backend manually from the dashboard |
| ⚡ **Runtime Algorithm Switch** | Change load-balancing strategy on the fly without restart |
| 📈 **Request Metrics** | Per-backend request count, active connections, errors, and EWMA response times |
| 🔒 **X-Forwarded Headers** | Adds `X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host` |
| 🧩 **WebSocket Proxying** | Supports `Upgrade` headers for WebSocket passthrough |
| 🛑 **Graceful Shutdown** | Handles `SIGINT`/`SIGTERM` to cleanly stop health checks and close servers |

---

## 🏗 Architecture

```
                            ┌─────────────────────────────┐
                            │     React Dashboard         │
                            │     (Port 3001)             │
                            │   ┌───────────────────┐     │
                            │   │   Socket.io        │◄────── Real-time state updates
                            │   └───────────────────┘     │
                            │   ┌───────────────────┐     │
                            │   │   REST API         │     │
                            │   │  /api/state        │     │
                            │   │  /api/algorithm    │     │
                            │   │  /api/backends/:id │     │
                            │   └───────────────────┘     │
                            └─────────────────────────────┘

  Clients                   ┌─────────────────────────────┐
    │                       │     Load Balancer Engine     │
    │   HTTP Requests       │        (Port 3000)           │
    ├──────────────────────►│                              │
    │                       │  ┌────────────────────────┐  │           ┌──────────────┐
    │                       │  │   Algorithm Selection   │  │    ┌────►│  Backend 1   │
    │                       │  │  • Round-Robin          │──┼────┤     │  :4001       │
    │                       │  │  • Least-Connections    │  │    │     └──────────────┘
    │                       │  └────────────────────────┘  │    │     ┌──────────────┐
    │                       │  ┌────────────────────────┐  │    ├────►│  Backend 2   │
    │                       │  │   Health Checker        │  │    │     │  :4002       │
    │                       │  │  • 10s interval         │──┼────┤     └──────────────┘
    │                       │  │  • 3-strike threshold   │  │    │     ┌──────────────┐
    │                       │  └────────────────────────┘  │    └────►│  Backend 3   │
    │                       └─────────────────────────────┘          │  :4003       │
    │                                                                └──────────────┘
```

---

## 📁 Project Structure

```
load-balancer/
├── package.json              # Backend dependencies
├── config.js                 # Central configuration (ports, backends, health check)
├── balancer.js               # Core load-balancing engine (Round-Robin, Least-Connections)
├── healthCheck.js            # Active health check monitor
├── server.js                 # Entry point — proxy server + API + Socket.io
├── demo-backends.js          # 3 simulated backend servers for local testing
├── README.md
└── dashboard/                # React (Vite) monitoring dashboard
    ├── package.json
    ├── vite.config.js        # Vite config with dev proxy rules
    ├── tailwind.config.js    # Custom dark theme, animations
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx          # React entry point
        ├── App.jsx           # Root component with Socket.io connection
        ├── index.css         # Tailwind + glassmorphism utilities
        └── components/
            ├── Header.jsx            # App header with live indicator
            ├── StatsBar.jsx          # Summary stats (total, healthy, unhealthy, requests)
            ├── AlgorithmSelector.jsx  # Algorithm toggle (RR / LC)
            ├── ServerGrid.jsx        # Backend server card grid
            ├── ServerCard.jsx        # Individual backend card with metrics
            └── ConnectionStatus.jsx  # Socket.io connection indicator
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### 1. Clone & Install

```bash
git clone https://github.com/your-username/load-balancer.git
cd load-balancer

# Install backend dependencies
npm install

# Install and build the dashboard
cd dashboard
npm install
npm run build
cd ..
```

### 2. Start Demo Backends (Terminal 1)

```bash
npm run demo
```

This launches 3 simulated HTTP servers on ports `4001`, `4002`, `4003`, each with a `/health` endpoint.

### 3. Start the Load Balancer (Terminal 2)

```bash
npm start
```

### 4. Open the Dashboard

| Service | URL |
|---------|-----|
| 🔀 **Load Balancer Proxy** | [http://localhost:3000](http://localhost:3000) |
| 📊 **Monitoring Dashboard** | [http://localhost:3001](http://localhost:3001) |

### 5. Send Test Traffic

```bash
# Send 50 requests through the load balancer
for i in {1..50}; do curl -s http://localhost:3000/ > /dev/null; done
```

Watch the dashboard update in real-time!

---

## ⚙ Configuration

All configuration lives in `config.js`. You can override values via environment variables:

```javascript
const config = {
  port: parseInt(process.env.LB_PORT) || 3000,         // Proxy port
  apiPort: parseInt(process.env.API_PORT) || 3001,      // Dashboard + API port
  algorithm: process.env.LB_ALGORITHM || 'round-robin', // 'round-robin' | 'least-connections'

  backends: [
    { id: 'backend-1', url: 'http://localhost:4001', weight: 1 },
    { id: 'backend-2', url: 'http://localhost:4002', weight: 1 },
    { id: 'backend-3', url: 'http://localhost:4003', weight: 1 },
  ],

  healthCheck: {
    interval: 10000,           // Check every 10 seconds
    timeout: 5000,             // 5s timeout per check
    unhealthyThreshold: 3,     // 3 consecutive failures → Unhealthy
    healthyThreshold: 1,       // 1 success → Healthy again
    path: '/health',           // Health check endpoint
  },
};
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LB_PORT` | `3000` | Port for the reverse proxy |
| `API_PORT` | `3001` | Port for the API + dashboard |
| `LB_ALGORITHM` | `round-robin` | Default algorithm (`round-robin` \| `least-connections`) |

---

## 📡 API Reference

### `GET /api/state`

Returns the complete load balancer state.

**Response:**
```json
{
  "algorithm": "round-robin",
  "backends": [
    {
      "id": "backend-1",
      "url": "http://localhost:4001",
      "status": "healthy",
      "enabled": true,
      "activeConnections": 0,
      "totalRequests": 142,
      "totalErrors": 0,
      "responseTimeMs": 87,
      "lastChecked": "2026-02-11T18:00:20.079Z"
    }
  ]
}
```

### `POST /api/algorithm`

Switch the load-balancing algorithm at runtime.

**Request:**
```json
{ "algorithm": "least-connections" }
```

**Response:**
```json
{ "message": "Algorithm set to least-connections", "algorithm": "least-connections" }
```

### `POST /api/backends/:id/toggle`

Enable or disable a specific backend.

**Request:**
```json
{ "enabled": false }
```

**Response:**
```json
{ "message": "Backend backend-2 disabled" }
```

---

## 📊 Dashboard

The monitoring dashboard provides a real-time view of the load balancer:

- **Stats Bar** — Total backends, healthy/unhealthy counts, total requests
- **Algorithm Selector** — Toggle between Round-Robin and Least Connections
- **Server Cards** — Per-backend metrics:
  - Health status with animated pulse indicator
  - Request count
  - Active connections
  - Average response time (EWMA)
  - Error count
  - Last health check timestamp
  - Enable/Disable toggle

### Dashboard Development

To develop the dashboard with hot-reload:

```bash
cd dashboard
npm run dev
```

This starts Vite on port `5173` with proxy rules that forward `/api` and `/socket.io` requests to the backend on port `3001`.

---

## ☁ Deployment on AWS

This load balancer requires a **persistent, always-on server** — it cannot run on serverless platforms (see [why below](#-why-not-vercel--serverless)). Here are the recommended AWS deployment options:

### Option 1: AWS EC2 (Recommended for Simplicity)

#### Step 1: Launch an EC2 Instance

1. Go to **AWS Console → EC2 → Launch Instance**
2. Choose **Amazon Linux 2023** or **Ubuntu 22.04 LTS**
3. Instance type: **t3.micro** (free tier) or **t3.small** for production
4. Configure Security Group:
   - **Inbound**: Allow TCP `80` (HTTP), `443` (HTTPS), `22` (SSH)
   - **Outbound**: Allow all

#### Step 2: Install Node.js

```bash
# SSH into your instance
ssh -i your-key.pem ec2-user@<your-ec2-ip>

# Install Node.js 18+ (Amazon Linux)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Or for Ubuntu:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 3: Deploy the Application

```bash
# Clone your repo
git clone https://github.com/your-username/load-balancer.git
cd load-balancer

# Install dependencies
npm install
cd dashboard && npm install && npm run build && cd ..

# Set environment variables
export LB_PORT=80
export API_PORT=3001
export LB_ALGORITHM=round-robin
```

#### Step 4: Run with PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [
    {
      name: 'load-balancer',
      script: 'server.js',
      env: {
        LB_PORT: 80,
        API_PORT: 3001,
        LB_ALGORITHM: 'round-robin',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
  ],
};
EOF

# Start with PM2
sudo pm2 start ecosystem.config.cjs
sudo pm2 save
sudo pm2 startup
```

#### Step 5: Set Up Nginx (Optional — for HTTPS)

```bash
sudo yum install -y nginx   # Amazon Linux
# or: sudo apt install -y nginx   # Ubuntu

sudo tee /etc/nginx/conf.d/load-balancer.conf << 'EOF'
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Proxy to dashboard/API
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
EOF

sudo systemctl restart nginx
```

---

### Option 2: AWS ECS with Fargate (Containerized)

#### Dockerfile

```dockerfile
FROM node:18-alpine AS dashboard-build
WORKDIR /app/dashboard
COPY dashboard/package*.json ./
RUN npm ci
COPY dashboard/ .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY *.js ./
COPY --from=dashboard-build /app/dashboard/dist ./dashboard/dist

EXPOSE 3000 3001

CMD ["node", "server.js"]
```

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker build -t load-balancer .
docker tag load-balancer:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/load-balancer:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/load-balancer:latest
```

Then create an ECS Service with Fargate launch type, mapping ports `3000` and `3001`.

---

### Option 3: AWS Elastic Beanstalk (Managed)

```bash
# Install EB CLI
pip install awsebcli

# Initialize and deploy
eb init load-balancer --platform node.js --region us-east-1
eb create production --instance_type t3.small
eb deploy
```

Add a `.ebextensions/nodecommand.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "node server.js"
  aws:elasticbeanstalk:application:environment:
    LB_PORT: "80"
    API_PORT: "3001"
```

---

## 🚫 Why Not Vercel / Serverless?

This application **cannot** run on serverless platforms like Vercel, Netlify Functions, or AWS Lambda. Here's why:

| Requirement | Serverless | This Load Balancer |
|---|---|---|
| **Always-on process** | ❌ Functions are ephemeral (cold starts, 10s–60s max execution) | ✅ Needs a persistent proxy server accepting continuous traffic |
| **WebSockets** | ❌ No persistent connections supported | ✅ Socket.io for real-time dashboard updates |
| **In-memory state** | ❌ Each invocation is stateless, no shared memory | ✅ Tracks active connections, health status, request counts |
| **Background timers** | ❌ No `setInterval` or cron-like scheduling | ✅ Health checks run every 10 seconds on a timer |
| **HTTP reverse proxy** | ❌ Can't act as a transparent proxy | ✅ Forwards full HTTP requests to backends with `http-proxy` |
| **Connection pooling** | ❌ New connections per invocation | ✅ Maintains proxy connection pools |

**Bottom line:** A load balancer is an infrastructure-level component that must be always-on. It's the opposite of a serverless workload. Use **EC2**, **ECS/Fargate**, or **Elastic Beanstalk** on AWS.

---

## 🧪 Testing

### Send traffic through the proxy

```bash
# Single request — see which backend responds
curl http://localhost:3000/

# Burst test — 100 concurrent requests
for i in {1..100}; do curl -s http://localhost:3000/ > /dev/null & done; wait
echo "Done!"
```

### Test algorithm switching

```bash
curl -X POST http://localhost:3001/api/algorithm \
  -H "Content-Type: application/json" \
  -d '{"algorithm": "least-connections"}'
```

### Test backend toggling

```bash
# Disable backend-2
curl -X POST http://localhost:3001/api/backends/backend-2/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'

# Re-enable it
curl -X POST http://localhost:3001/api/backends/backend-2/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

### Test health check failover

```bash
# Kill one demo backend (e.g., on port 4002)
# The health checker will mark it unhealthy after ~30 seconds (3 failed checks)
# Traffic will automatically stop routing to it
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Proxy Engine** | [http-proxy](https://github.com/http-party/node-http-proxy) |
| **API Server** | [Express](https://expressjs.com/) |
| **Real-Time** | [Socket.io](https://socket.io/) |
| **Frontend** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Runtime** | Node.js 18+ (ES Modules) |

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ⚡ by a DevOps engineer who believes load balancers should look good too.**

</div>
]]>
