// =========================================================
//  Servidor HTTP minimalista — CuentaRegresivaVacaciones
//  Sirve los archivos estáticos y expone una API simple
//  para leer / guardar la fecha de la cuenta regresiva en
//  data/config.json (persistencia en disco).
//
//  Uso:  node server.js          (puerto 3000 por defecto)
//        PORT=8080 node server.js
// =========================================================
'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT        = process.env.PORT || 3000;
const CONFIG_FILE = path.join(__dirname, 'data', 'config.json');
const PUBLIC_DIR  = __dirname;

// ---------------------------------------------------------------------------
//  Tabla de tipos MIME para los archivos estáticos del proyecto
// ---------------------------------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

// ---------------------------------------------------------------------------
//  Helpers de config
// ---------------------------------------------------------------------------
function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { targetDate: '2026-12-19T06:00:00' };
  }
}

function writeConfig(data) {
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
//  Servidor
// ---------------------------------------------------------------------------
const server = http.createServer((req, res) => {
  const urlObj  = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = urlObj.pathname;

  // ---- CORS básico (útil si se sirve en LAN / ngrok) ----
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ---- API ----
  if (pathname === '/api/config') {
    if (req.method === 'GET') {
      const config = readConfig();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(config));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          if (!payload.targetDate || isNaN(new Date(payload.targetDate).getTime())) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'targetDate inválido' }));
            return;
          }
          const config = { targetDate: payload.targetDate };
          writeConfig(config);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, targetDate: config.targetDate }));
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'JSON inválido' }));
        }
      });
      return;
    }

    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Método no permitido' }));
    return;
  }

  // ---- Archivos estáticos ----
  // Normalizar ruta: / → /index.html
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(PUBLIC_DIR, filePath);

  // Prevenir path traversal fuera del directorio público
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== PUBLIC_DIR) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // No exponer data/config.json directamente
  if (filePath.startsWith(path.join(PUBLIC_DIR, 'data'))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext      = path.extname(filePath).toLowerCase();
    const mimeType = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': mimeType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
  console.log(`   Configuración guardada en: ${CONFIG_FILE}`);
});
