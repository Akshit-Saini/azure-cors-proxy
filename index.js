const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
    res.set('Access-Control-Allow-Origin', '*'); 
    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Azure CORS Proxy is running!');
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});