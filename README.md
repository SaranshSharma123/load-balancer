<div align="center">

# ⚡ Layer 7 Load Balancer

**Production-grade Node.js reverse proxy with a real-time React monitoring dashboard.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Features](#-features) · [Quick Start](#-quick-start) · [Dashboard](#-dashboard) · [API](#-api-reference) · [Deploy](#-deployment-on-aws) · [Testing](#-load-testing)

</div>

---

<div align="center">

![Dashboard Preview](docs/dashboard-preview.png)

</div>

---

## ✨ Features

- 🔀 **Round-Robin & Least-Connections** — two pluggable algorithms, switchable at runtime
- 🏥 **Active Health Checks** — pings `/health` every 10s; 3 consecutive failures → offline
- 📊 **Real-Time Dashboard** — glassmorphism React UI with live Socket.io updates
- 🔌 **Backend Toggle** — enable/disable any backend from the dashboard with one click
- 📈 **Per-Server Metrics** — request count, active connections, errors, EWMA response time
- 🔒 **X-Forwarded Headers** — automatically adds `X-Forwarded-For`, `Proto`, `Host`
- 🧩 **WebSocket Proxying** — transparent `Upgrade` header passthrough
- 🛑 **Graceful Shutdown** — `SIGINT`/`SIGTERM` handlers for clean process exit
- 🧪 **Built-In Stress Tester** — multi-phase load test with latency percentiles and distribution reports

---

## 🏗 Architecture

```
                                    ┌──────────────────────────┐
                                    │    Monitoring Dashboard   │
                                    │      React + Vite         │
                                    │      (Port 3001)          │
                                    │                           │
                                    │  ┌──────────┐ ┌────────┐ │
                                    │  │ Socket.io │ │REST API│ │
                                    │  └────▲─────┘ └───▲────┘ │
                                    └───────┼───────────┼──────┘
                                            │           │
  Clients                                   │ Real-time │
    │                                       │  state    │
    │                        ┌──────────────┴───────────┴──────────┐
    │   HTTP / WS            │       Load Balancer Engine           │
    ├───────────────────────►│            (Port 3000)               │
    │                        │                                      │
    │                        │  ┌──────────────┐  ┌──────────────┐ │
    │                        │  │  Algorithm    │  │   Health     │ │
    │                        │  │  Selector     │  │   Checker    │ │    ┌─────────────┐
    │                        │  │              ─┼──┤           ───┼────►│  Backend 1   │
    │                        │  │  • Round-Robin│  │  • 10s poll  │ │   │  :4001       │
    │                        │  │  • Least-Conn │  │  • 3 strikes │ ├──►├─────────────┤
    │                        │  └──────────────┘  └──────────────┘ │   │  Backend 2   │
    │                        │                                      │   │  :4002       │
    │                        └──────────────────────────────────────┘   ├─────────────┤
    │                                                                   │  Backend 3   │
    │                                                                   │  :4003       │
    │                                                                   └─────────────┘
```

---

## 📁 Project Structure

```
load-balancer/
├── server.js                 # Entry point — proxy + API + Socket.io
├── balancer.js               # Core engine (Round-Robin, Least-Connections)
├── healthCheck.js            # Active health monitor
├── config.js                 # Ports, backends, thresholds
├── demo-backends.js          # 3 mock HTTP servers for testing
├── test-load.js              # Stress test with multi-phase support
├── Dockerfile                # Multi-stage production build
│
└── dashboard/                # React monitoring UI
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx           # Socket.io state + API calls
        ├── index.css         # Glassmorphism design system
        └── components/
            ├── Header.jsx
            ├── StatsBar.jsx
            ├── AlgorithmSelector.jsx
            ├── ServerGrid.jsx
            ├── ServerCard.jsx
            └── ConnectionStatus.jsx
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- npm ≥ 9

### Install

```bash
git clone https://github.com/SaranshSharma123/load-balancer.git
cd load-balancer

# Backend
npm install

# Dashboard
cd dashboard && npm install && npm run build && cd ..
```

### Run

Open **two terminals**:

```bash
# Terminal 1 — start 3 demo backend servers
npm run demo
```

```bash
# Terminal 2 — start the load balancer + dashboard
npm start
```

```
╔══════════════════════════════════════════════════════════════╗
║          ⚡  Layer 7 Load Balancer — Running  ⚡            ║
╠══════════════════════════════════════════════════════════════╣
║  🔀  Proxy listening on       → http://localhost:3000       ║
║  📊  Dashboard & API on       → http://localhost:3001       ║
║  ⚙️   Algorithm               → round-robin                ║
║  🖥️   Backends configured     → 3                          ║
╚══════════════════════════════════════════════════════════════╝
```

| Service | URL |
|---------|-----|
| Load Balancer (proxy) | [`http://localhost:3000`](http://localhost:3000) |
| Dashboard + API | [`http://localhost:3001`](http://localhost:3001) |
| Demo Backend 1 | `http://localhost:4001` |
| Demo Backend 2 | `http://localhost:4002` |
| Demo Backend 3 | `http://localhost:4003` |

---

## ⚙ Configuration

Edit `config.js` or use environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `LB_PORT` | `3000` | Reverse proxy port |
| `API_PORT` | `3001` | Dashboard & API port |
| `LB_ALGORITHM` | `round-robin` | `round-robin` or `least-connections` |

### Backend Targets

```javascript
// config.js
backends: [
  { id: 'api-1', url: 'http://10.0.1.10:8080', weight: 1 },
  { id: 'api-2', url: 'http://10.0.1.11:8080', weight: 1 },
  { id: 'api-3', url: 'http://10.0.1.12:8080', weight: 1 },
],
```

### Health Check Tuning

```javascript
healthCheck: {
  interval: 10000,         // ping every 10s
  timeout: 5000,           // 5s per check
  unhealthyThreshold: 3,   // 3 failures → offline
  healthyThreshold: 1,     // 1 success → back online
  path: '/health',         // endpoint to probe
},
```

---

## 📊 Dashboard

The monitoring dashboard updates in real-time via Socket.io:

| Section | What it shows |
|---------|---------------|
| **Stats Bar** | Total backends · Healthy · Unhealthy · Total requests |
| **Algorithm Selector** | Click to switch between Round-Robin and Least Connections |
| **Server Cards** | Status badge · Request count · Active connections · Avg response time · Errors · Enable/Disable toggle |

### Dashboard Development

```bash
cd dashboard
npm run dev     # Vite dev server on :5173 with API proxy to :3001
```

---

## 📡 API Reference

### Get State

```
GET /api/state
```

```json
{
  "algorithm": "round-robin",
  "backends": [
    {
      "id": "backend-1",
      "url": "http://localhost:4001",
      "status": "healthy",
      "enabled": true,
      "activeConnections": 2,
      "totalRequests": 1458,
      "totalErrors": 0,
      "responseTimeMs": 87,
      "lastChecked": "2026-02-11T18:00:20.079Z"
    }
  ]
}
```

### Switch Algorithm

```
POST /api/algorithm
Content-Type: application/json

{ "algorithm": "least-connections" }
```

### Toggle Backend

```
POST /api/backends/:id/toggle
Content-Type: application/json

{ "enabled": false }
```

---

## 🧪 Load Testing

A built-in stress test script is included with concurrent request support, latency percentiles, and per-backend distribution tracking.

### Quick Test (500 requests, 50 concurrency)

```bash
npm test
```

### Multi-Phase Stress Test

Runs 6 phases automatically — warm-up, ramp-up, burst, sustained, spike, cool-down:

```bash
npm run test:phases
```

### Heavy Load (2000 requests, 200 concurrency)

```bash
npm run test:heavy
```

### Custom Parameters

```bash
node test-load.js --requests 1000 --concurrency 100
node test-load.js --target http://your-server.com --requests 5000 --concurrency 200
```

### Sample Output

```
╔══════════════════════════════════════════════════════════╗
║          🧪  Load Balancer Stress Test                  ║
╠══════════════════════════════════════════════════════════╣
║  Target       : http://localhost:3000                   ║
║  Requests     : 2150                                    ║
║  Concurrency  : 75                                      ║
╚══════════════════════════════════════════════════════════╝

  ████████████████████████████████████████  100.0%  2150/2150

────────────────────────────────────────────────────────────
  📊  OVERALL SUMMARY
────────────────────────────────────────────────────────────
  Throughput
    Requests/sec     : 208.7 RPS

  Latency
    p50              : 137.0ms
    p95              : 209.0ms
    p99              : 241.1ms

  Backend Distribution
    backend-1     ██████████████████████████████  717 (33.3%)
    backend-2     ██████████████████████████████  717 (33.3%)
    backend-3     ██████████████████████████████  716 (33.3%)
────────────────────────────────────────────────────────────
```

---

## ☁ Deployment on AWS

> **Why not Vercel?** This is an always-on proxy server with WebSockets, in-memory state, and background health-check timers. Serverless functions are stateless and ephemeral — fundamentally incompatible. See [details below](#-why-not-serverless).

### Option 1 — EC2 + PM2 *(simplest)*

```bash
# On your EC2 instance (Amazon Linux / Ubuntu)
git clone https://github.com/your-username/load-balancer.git
cd load-balancer
npm install
cd dashboard && npm install && npm run build && cd ..

# Install PM2 and start
sudo npm install -g pm2
pm2 start server.js --name load-balancer
pm2 save && pm2 startup
```

### Option 2 — Docker + ECS Fargate *(production)*

A multi-stage `Dockerfile` is included:

```bash
docker build -t load-balancer .
docker run -p 3000:3000 -p 3001:3001 load-balancer
```

Push to ECR and deploy on ECS Fargate:

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com

docker tag load-balancer:latest <ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com/load-balancer:latest
docker push <ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com/load-balancer:latest
```

### Option 3 — Elastic Beanstalk *(managed)*

```bash
pip install awsebcli
eb init load-balancer --platform node.js --region us-east-1
eb create production --instance_type t3.small
eb deploy
```

### Optional: Nginx + HTTPS

Put Nginx in front of the dashboard for TLS termination:

```nginx
server {
    listen 443 ssl;
    server_name lb.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/lb.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lb.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🚫 Why Not Serverless?

| What this app needs | Serverless (Vercel / Lambda) |
|---|---|
| Always-on proxy process | ❌ Ephemeral, cold starts |
| WebSocket connections | ❌ Not supported |
| In-memory state tracking | ❌ Stateless per invocation |
| Background health-check timers | ❌ No `setInterval` |
| Transparent HTTP proxying | ❌ Can't act as reverse proxy |

**Use EC2, ECS Fargate, or Elastic Beanstalk instead.**

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| Proxy engine | [http-proxy](https://github.com/http-party/node-http-proxy) |
| API server | [Express 4](https://expressjs.com) |
| Real-time comms | [Socket.io 4](https://socket.io) |
| Frontend | [React 18](https://react.dev) + [Vite 5](https://vitejs.dev) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) |
| Icons | [Lucide React](https://lucide.dev) |
| Runtime | Node.js 18+ (ES Modules) |

---

## 📜 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ⚡ by a DevOps engineer who believes load balancers should look good too.**

[⬆ Back to top](#-layer-7-load-balancer)

</div>
