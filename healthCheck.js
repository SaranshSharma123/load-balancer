import http from 'http';
import config from './config.js';

class HealthChecker {
    constructor(balancer) {
        this.balancer = balancer;
        this.interval = null;
        this.config = config.healthCheck;
    }
    start() {
        console.log(`[HealthCheck] Starting — interval: ${this.config.interval}ms, path: ${this.config.path}`);
        this._runChecks();

        this.interval = setInterval(() => {
            this._runChecks();
        }, this.config.interval);
    }
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('[HealthCheck] Stopped.');
        }
    }
    async _runChecks() {
        const checks = this.balancer.backends.map((backend) => this._checkBackend(backend));
        await Promise.allSettled(checks);
        this.balancer._emitState();
    }
    _checkBackend(backend) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const url = new URL(this.config.path, backend.url);

            const req = http.get(url.toString(), { timeout: this.config.timeout }, (res) => {
                const elapsed = Date.now() - startTime;
                backend.lastChecked = new Date().toISOString();

                if (res.statusCode >= 200 && res.statusCode < 400) {
                    this._onSuccess(backend, elapsed);
                } else {
                    this._onFailure(backend, `HTTP ${res.statusCode}`);
                }
                res.resume();
                resolve();
            });

            req.on('error', (err) => {
                backend.lastChecked = new Date().toISOString();
                this._onFailure(backend, err.message);
                resolve();
            });

            req.on('timeout', () => {
                backend.lastChecked = new Date().toISOString();
                this._onFailure(backend, 'Timeout');
                req.destroy();
                resolve();
            });
        });
    }
    _onSuccess(backend, elapsed) {
        backend.failCount = 0;
        backend.successCount++;

        if (backend.status === 'unhealthy' && backend.successCount >= this.config.healthyThreshold) {
            backend.status = 'healthy';
            console.log(`[HealthCheck] ✅ ${backend.id} (${backend.url}) is now HEALTHY (${elapsed}ms)`);
        }
    }
    _onFailure(backend, reason) {
        backend.successCount = 0;
        backend.failCount++;

        if (backend.failCount >= this.config.unhealthyThreshold && backend.status === 'healthy') {
            backend.status = 'unhealthy';
            console.log(`[HealthCheck] ❌ ${backend.id} (${backend.url}) marked UNHEALTHY — reason: ${reason}`);
        } else if (backend.status === 'healthy') {
            console.log(`[HealthCheck] ⚠️  ${backend.id} fail ${backend.failCount}/${this.config.unhealthyThreshold} — ${reason}`);
        }
    }
}

export default HealthChecker;
