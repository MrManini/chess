const express = require('express');
const app = express();
const https = require('https');
const http = require('http');
const fs = require('fs');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
    key: fs.readFileSync(`/etc/letsencrypt/live/chess.servegame.com/privkey.pem`),
    cert: fs.readFileSync(`/etc/letsencrypt/live/chess.servegame.com/fullchain.pem`)
}, app).listen(443, () => {
    
    console.log(`HTTPS Server running on https://localhost:443`);
});

http.createServer((req, res) => {
    res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}` });
    res.end();
}).listen(80, () => {
    console.log(`HTTP server redirecting to HTTPS on port 80`);
});