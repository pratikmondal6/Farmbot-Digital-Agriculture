const express = require('express');
const cors = require('cors');
const plantRoutes = require('./routes/plantRoutes');

const app = express();

// CORS-Setup – nur EINMAL definieren!
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false, // falls du keine Cookies brauchst
};

// CORS aktivieren
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ❗ wichtig für Preflight

// JSON-Body-Parser
app.use(express.json());

// Pflanzenrouten
app.use('/api/plant', plantRoutes);

// Testroute
app.get('/', (req, res) => {
  res.send('API server is running!');
});

//  Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
