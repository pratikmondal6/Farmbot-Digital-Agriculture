const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const cors = require('cors');



app.use(cors());
// for getting cookies
app.use(cookieParser());

require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.PORT || 5001;
const server = app.listen(port, () => console.log(`Listening on ${port}...`));

module.exports = server;