import http from 'http';
const ports = [4001, 4003];
ports.forEach((port, index) => {
    const serverName = `backend-${index + 1}`;
    const server = http.createServer((req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: 'ok', server: serverName }));
        }
        const delay = Math.floor(Math.random() * 150) + 50;
        setTimeout(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                server: serverName,
                port,
                path: req.url,
                method: req.method,
                timestamp: new Date().toISOString(),
                processingTime: `${delay}ms`,
            }));
        }, delay);
    });

    server.listen(port, () => {
        console.log(`[Demo] 🟢 ${serverName} listening on http://localhost:${port}`);
    });
});

console.log('\n[Demo] All backend servers started. Press Ctrl+C to stop.\n');
