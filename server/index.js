import cookieParser from 'cookie-parser';
import express from "express";
const app = express();

// for getting cookies
app.use(cookieParser());

require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on ${port}...`));

export default server;