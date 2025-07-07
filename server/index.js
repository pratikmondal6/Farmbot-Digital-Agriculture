const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const cors = require('cors');
const config = require('config');
const routes = require('./startup/routes');
const plantRoutes = require('./routes/plantRoutes');
const seedistanceRoutes = require('./routes/seedistance');
const port = process.env.PORT || 5001;


app.use(cors());
app.use(express.json());
app.use(cookieParser()); // for getting cookies
app.use('/api/plant', plantRoutes);
app.use('/api/seedistance', seedistanceRoutes);


require('./startup/db')();
require('./services/farmbotStatusService');
require('./startup/routes')(app);


// Only start server if not required by another module (like in tests)
if (require.main === module) {
  app.listen(port, () => console.log(`Listening on ${port}...`));
}

module.exports = app;