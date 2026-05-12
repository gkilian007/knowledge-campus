import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.io
  const { initSocketServer } = await import('./src/lib/socket-server');
  initSocketServer(server);

  server.listen(port, () => {
    console.log(`> Knowledge Campus ready on http://localhost:${port}`);
    console.log(`> Socket.io available at /api/socketio`);
  });
});
