const http = require('http');
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello from Kubernetes456!', version: '1.0.0' }));
}).listen(PORT, () => console.log(`Server running on port ${PORT}`));
