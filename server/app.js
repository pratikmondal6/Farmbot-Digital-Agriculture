const express = require('express');
const plantRoutes = require('./routes/plantRoutes');

const app = express();
app.use(express.json());
app.use('/api/plant', plantRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});