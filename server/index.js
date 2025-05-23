const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cookieParser());

require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.log(`Listening on ${port}...`));

module.exports = server;
