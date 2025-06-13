const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const cors = require('cors');
const config = require('config');
const routes = require('./startup/routes');

app.use(cors());

// ✅ JSON-Body-Parser hinzufügen
app.use(express.json());

// for getting cookies
app.use(cookieParser());

require('./startup/db')();
require('./services/farmbotStatusService');

const plantRoutes = require('./routes/plantRoutes');
const seedistanceRoutes = require('./routes/seedistance');

app.use('/api/plant', plantRoutes);
app.use('/api/seedistance', seedistanceRoutes);

// 🚨 routes(app) ganz am Ende, damit 404-Fallback nicht alles abfängt
require('./startup/routes')(app);


const port = process.env.PORT || 5000;

// Only start server if not required by another module (like in tests)
if (require.main === module) {
  app.listen(port, () => console.log(`Listening on ${port}...`));
}

module.exports = app;
