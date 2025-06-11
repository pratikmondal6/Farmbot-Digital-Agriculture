const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const cors = require('cors');
const config = require('config');
const routes = require('./startup/routes');

app.use(cors());
// for getting cookies
app.use(cookieParser());
// CORS configuration
// app.use(cors({
//     origin: 'http://localhost:3000', // Allow requests from React client
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

require("./startup/routes")(app);
require("./startup/db")();
require('dotenv').config();
require('./services/farmbotStatusService');
const plantRoutes = require('./routes/plantRoutes');
const seedistanceRoutes = require('./routes/seedistance');

// Use routes
app.use('/api/plant', plantRoutes);
app.use('/api/seedistance', seedistanceRoutes);

const port = process.env.PORT || 5000;

// Only start server if not required by another module (like in tests)
if (require.main === module) {
  app.listen(port, () => console.log(`Listening on ${port}...`));
}

module.exports = app;
