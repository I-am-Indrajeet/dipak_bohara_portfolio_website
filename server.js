const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// ──────────────────── SECURITY HEADERS ────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ──────────────────── COMPRESSION (Gzip/Brotli) ────────────────────
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// ──────────────────── STATIC FILE SERVING WITH AGGRESSIVE CACHING ────────────────────
const staticOptions = {
  etag: true,
  lastModified: true,
  maxAge: isProd ? '1y' : '0',
  setHeaders: (res, filePath) => {
    // Immutable cache for hashed assets
    if (filePath.match(/\.(css|js)$/)) {
      res.setHeader('Cache-Control', isProd
        ? 'public, max-age=31536000, immutable'
        : 'no-cache'
      );
    }
    // Cache images for 30 days
    if (filePath.match(/\.(png|jpg|jpeg|webp|avif|svg|ico|gif)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
    // Cache fonts for 1 year
    if (filePath.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
};

app.use(express.static(path.join(__dirname, 'public'), staticOptions));

// ──────────────────── PERFORMANCE HEADERS ────────────────────
app.use((req, res, next) => {
  // Preconnect hints for Google Fonts
  res.setHeader('Link', [
    '<https://fonts.googleapis.com>; rel=preconnect',
    '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
  ].join(', '));

  // Performance timing
  res.setHeader('Server-Timing', `gen;dur=0;desc="Static"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  next();
});

// ──────────────────── SPA FALLBACK ────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ──────────────────── ERROR HANDLING ────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).send('Internal Server Error');
});

// ──────────────────── START SERVER ────────────────────
app.listen(PORT, () => {
  console.log(`\n  🚀 Dipak Bohara Website`);
  console.log(`  ────────────────────────`);
  console.log(`  ✅ Server running at http://localhost:${PORT}`);
  console.log(`  📦 Mode: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`  🗜️  Compression: ENABLED`);
  console.log(`  🛡️  Security: Helmet ACTIVE\n`);
});
