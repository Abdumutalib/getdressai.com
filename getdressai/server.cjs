
// Load environment variables from .env
require('dotenv').config();



const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;



// Parse JSON bodies for API
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Redirect root to main page
app.get('/', (req, res) => {
	res.redirect('/marketplace-recommend.html');
});

// Enable API endpoint
app.use('/api/recommend', require('./api/recommend.cjs'));

app.listen(PORT, () => {
	console.log(`Server running: http://localhost:${PORT}`);
});
