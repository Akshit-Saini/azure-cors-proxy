const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS Middleware: Allow all origins and handle preflight ---
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Or set to your Vercel domain for more security
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// --- Main Proxy Route ---
app.post('/sparql', async (req, res) => {
  const { endpoint, query } = req.body;
  if (!endpoint || !query) {
    return res.status(400).json({ error: 'Missing endpoint or query' });
  }
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json',
      },
      body: query,
    });
    const text = await response.text();
    // Set CORS header on the proxied response as well
    res.header('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
});

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.send('Azure CORS Proxy is running!');
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});