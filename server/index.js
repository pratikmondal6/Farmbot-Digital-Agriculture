const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors'); // Keep this — needed for cross-origin requests

const app = express();

app.use(cookieParser());
app.use(cors()); // Add this if it's needed in your project

require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.log(`Listening on ${port}...`));

module.exports = server;
