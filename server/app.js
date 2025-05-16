const express = require('express');
const cors = require('cors');
const plantRoutes = require('./routes/plantRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/plant', plantRoutes);

app.get('/', (req, res) => {
  res.send('API server is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});