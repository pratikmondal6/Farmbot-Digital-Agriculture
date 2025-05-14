const cookieParser = require('cookie-parser');
const express = require("express");
const app = express();

// for getting cookies
app.use(cookieParser());

require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on ${port}...`));

module.exports = server;