const config = {
  port: parseInt(process.env.LB_PORT) || 3000,
  apiPort: parseInt(process.env.API_PORT) || 3001,
  algorithm: process.env.LB_ALGORITHM || 'round-robin',
  backends: [
    { id: 'backend-1', url: 'http://localhost:4001', weight: 1 },
    { id: 'backend-2', url: 'http://localhost:4002', weight: 1 },
    { id: 'backend-3', url: 'http://localhost:4003', weight: 1 },
  ],
  healthCheck: {
    interval: 10000,
    timeout: 5000,
    unhealthyThreshold: 3,
    healthyThreshold: 1,
    path: '/health',
  },
  proxy: {
    xfwd: true,
    changeOrigin: true,
    proxyTimeout: 30000,
    timeout: 30000,
  },
};

export default config;
