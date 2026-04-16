// Advanced AI recommend handler
const recommendHandler = require('./api/recommend.js');
// Advanced AI recommend endpoint
app.post('/api/recommend', express.json(), (req, res) => recommendHandler(req, res));
// GetDressAI Express backend (SPA + demo API)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'dressai_secret';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Fake user DB (memory only)
const users = [];

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || password.length < 8) return res.json({ error: 'Маълумотлар тўлиқ эмас ёки парол қисқа' });
  if (users.find(u => u.email === email)) return res.json({ error: 'Email банд' });
  const user = { id: users.length + 1, email, password, name: name || email.split('@')[0], plan: 'Free', remainingGenerations: 5 };
  users.push(user);
  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.json({ error: 'Email ёки парол нотўғри' });
  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// Auth: Me
app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.json({ error: 'Токен йўқ' });
  try {
    const token = auth.replace('Bearer ', '');
    const payload = jwt.verify(token, SECRET);
    const user = users.find(u => u.id === payload.id);
    if (!user) return res.json({ error: 'Фойдаланувчи топилмади' });
    res.json({ user });
  } catch {
    res.json({ error: 'Токен нотўғри' });
  }
});

// Recommend API (outfit/image)
app.post('/api/recommend', (req, res) => {
  const { action, data } = req.body;
  if (action === 'outfit') {
    // Simple demo logic
    const { gender, style, season, minPrice, maxPrice } = data;
    const result = `${season} фасли учун ${style} услубида ${gender === 'female' ? 'аёллар' : gender === 'male' ? 'эркаклар' : 'унисекс'} кийимлар (${minPrice}$ - ${maxPrice}$)`;
    // Fake products
    const products = [
      { title: 'AI футболка', price: 29, image: 'https://placehold.co/200x200?text=Outfit1', url: '#' },
      { title: 'AI шим', price: 49, image: 'https://placehold.co/200x200?text=Outfit2', url: '#' }
    ];
    res.json({ success: true, result, products });
  } else if (action === 'image') {
    const { prompt } = data;
    res.json({ success: true, imageUrl: 'https://placehold.co/400x400?text=AI+Image' });
  } else {
    res.json({ success: false, error: 'Нотўғри action' });
  }
});

// Serve index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('GetDressAI server running on port', PORT));
