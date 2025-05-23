const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

// for getting cookies
app.use(cookieParser());

require("./startup/routes")(app);
require("./startup/db")();
require('dotenv').config();
const plantRoutes = require('./routes/plantRoutes');
app.use('/api/plant', plantRoutes);

const port = process.env.PORT || 5000;

// Only start server if not required by another module (like in tests)
if (require.main === module) {
  app.listen(port, () => console.log(`Listening on ${port}...`));
}

module.exports = app;