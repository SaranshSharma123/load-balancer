import httpProxy from 'http-proxy';
import config from './config.js';
class LoadBalancer {
    constructor(io) {
        this.io = io;
        this.algorithm = config.algorithm;
        this.currentIndex = 0;
        this.backends = config.backends.map((b) => ({
            ...b,
            status: 'healthy',
            enabled: true,
            activeConnections: 0,
            totalRequests: 0,
            totalErrors: 0,
            failCount: 0,
            successCount: 0,
            responseTimeMs: 0,
            lastChecked: null,
        }));
        this.proxy = httpProxy.createProxyServer({
            xfwd: config.proxy.xfwd,
            changeOrigin: config.proxy.changeOrigin,
            proxyTimeout: config.proxy.proxyTimeout,
            timeout: config.proxy.timeout,
        });
        this.proxy.on('error', (err, req, res) => {
            const backend = req._lbBackend;
            if (backend) {
                backend.totalErrors++;
                backend.activeConnections = Math.max(0, backend.activeConnections - 1);
                this._emitState();
            }

            if (!res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Bad Gateway',
                    message: `Backend ${backend?.id || 'unknown'} is unreachable.`,
                }));
            }
        });
        this.proxy.on('proxyRes', (proxyRes, req) => {
            const backend = req._lbBackend;
            if (backend) {
                const elapsed = Date.now() - req._lbStartTime;
                backend.responseTimeMs = backend.totalRequests === 1
                    ? elapsed
                    : Math.round(backend.responseTimeMs * 0.8 + elapsed * 0.2);
            }
        });
    }
    _getAvailableBackends() {
        return this.backends.filter((b) => b.status === 'healthy' && b.enabled);
    }
    _roundRobin(available) {
        if (available.length === 0) return null;
        const backend = available[this.currentIndex % available.length];
        this.currentIndex = (this.currentIndex + 1) % available.length;
        return backend;
    }
    _leastConnections(available) {
        if (available.length === 0) return null;
        return available.reduce((min, b) =>
            b.activeConnections < min.activeConnections ? b : min
        );
    }
    selectBackend() {
        const available = this._getAvailableBackends();
        if (available.length === 0) return null;

        switch (this.algorithm) {
            case 'least-connections':
                return this._leastConnections(available);
            case 'round-robin':
            default:
                return this._roundRobin(available);
        }
    }
    handleRequest(req, res) {
        const backend = this.selectBackend();

        if (!backend) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                error: 'Service Unavailable',
                message: 'No healthy backends available.',
            }));
        }
        req._lbBackend = backend;
        req._lbStartTime = Date.now();
        backend.activeConnections++;
        backend.totalRequests++;
        res.on('finish', () => {
            backend.activeConnections = Math.max(0, backend.activeConnections - 1);
            this._emitState();
        });
        this._emitState();
        this.proxy.web(req, res, { target: backend.url });
    }
    handleUpgrade(req, socket, head) {
        const backend = this.selectBackend();
        if (!backend) {
            socket.destroy();
            return;
        }
        this.proxy.ws(req, socket, head, { target: backend.url });
    }
    setAlgorithm(algo) {
        if (['round-robin', 'least-connections'].includes(algo)) {
            this.algorithm = algo;
            this.currentIndex = 0;
            this._emitState();
            return true;
        }
        return false;
    }
    toggleBackend(backendId, enabled) {
        const backend = this.backends.find((b) => b.id === backendId);
        if (!backend) return false;
        backend.enabled = enabled;
        this._emitState();
        return true;
    }
    getState() {
        return {
            algorithm: this.algorithm,
            backends: this.backends.map((b) => ({
                id: b.id,
                url: b.url,
                status: b.status,
                enabled: b.enabled,
                activeConnections: b.activeConnections,
                totalRequests: b.totalRequests,
                totalErrors: b.totalErrors,
                responseTimeMs: b.responseTimeMs,
                lastChecked: b.lastChecked,
            })),
        };
    }
    _emitState() {
        if (this.io) {
            this.io.emit('lb:state', this.getState());
        }
    }
}

export default LoadBalancer;
