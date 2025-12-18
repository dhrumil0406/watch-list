const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });

const clients = new Set();

wss.on('connection', (ws) => {
    console.log('React client connected');
    clients.add(ws);

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

const broadcast = (data) => {
    try {
        const message = JSON.stringify(data);
        for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    } catch (err) {
        console.error("❌ Broadcast error:", err);
    }
};

module.exports = { broadcast };
