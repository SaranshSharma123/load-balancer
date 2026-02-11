import http from 'http';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import LoadBalancer from './balancer.js';
import HealthChecker from './healthCheck.js';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiApp = express();
apiApp.use(cors());
apiApp.use(express.json());
apiApp.use(express.static(path.join(__dirname, 'dashboard', 'dist')));

const apiServer = http.createServer(apiApp);
const io = new SocketIOServer(apiServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const balancer = new LoadBalancer(io);
const healthChecker = new HealthChecker(balancer);

apiApp.get('/api/state', (req, res) => {
    res.json(balancer.getState());
});

apiApp.post('/api/algorithm', (req, res) => {
    const { algorithm } = req.body;
    const success = balancer.setAlgorithm(algorithm);
    if (success) {
        res.json({ message: `Algorithm set to ${algorithm}`, algorithm });
    } else {
        res.status(400).json({ error: `Invalid algorithm: ${algorithm}` });
    }
});

apiApp.post('/api/backends/:id/toggle', (req, res) => {
    const { id } = req.params;
    const { enabled } = req.body;
    const success = balancer.toggleBackend(id, enabled);
    if (success) {
        res.json({ message: `Backend ${id} ${enabled ? 'enabled' : 'disabled'}` });
    } else {
        res.status(404).json({ error: `Backend ${id} not found` });
    }
});

apiApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard', 'dist', 'index.html'));
});

io.on('connection', (socket) => {
    console.log(`[Socket.io] Dashboard client connected: ${socket.id}`);
    socket.emit('lb:state', balancer.getState());

    socket.on('disconnect', () => {
        console.log(`[Socket.io] Dashboard client disconnected: ${socket.id}`);
    });
});

const proxyServer = http.createServer((req, res) => {
    balancer.handleRequest(req, res);
});

proxyServer.on('upgrade', (req, socket, head) => {
    balancer.handleUpgrade(req, socket, head);
});

proxyServer.listen(config.port, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║          ⚡  Layer 7 Load Balancer — Running  ⚡            ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  🔀  Proxy listening on       → http://localhost:${config.port}       ║`);
    console.log(`║  📊  Dashboard & API on       → http://localhost:${config.apiPort}       ║`);
    console.log(`║  ⚙️   Algorithm               → ${config.algorithm.padEnd(20)}     ║`);
    console.log(`║  🖥️   Backends configured     → ${String(config.backends.length).padEnd(20)}     ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
});

apiServer.listen(config.apiPort, () => {
    console.log(`[API] Dashboard server ready at http://localhost:${config.apiPort}`);
    healthChecker.start();
});

const shutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    healthChecker.stop();
    proxyServer.close();
    apiServer.close();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
