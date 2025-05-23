const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const cors = require('cors');
const config = require('config');
const routes = require('./startup/routes');

// for getting cookies
app.use(cookieParser());
// CORS configuration
app.use(cors({
    origin: 'http://localhost:3001', // Allow requests from React client
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.PORT || 5000;
// Routes setup
routes(app);

const server = app.listen(port, () => console.log(`Listening on ${port}...`));

module.exports = server;