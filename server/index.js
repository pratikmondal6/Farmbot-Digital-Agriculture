const cookieParser = require('cookie-parser');
<<<<<<< HEAD
const express = require("express");
const cors = require("cors");
=======
const express = require('express');
>>>>>>> b8b0405290688515b26becffa0794bc5edfed96c
const app = express();

// for getting cookies
app.use(cookieParser());

require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on ${port}...`));

module.exports = server;