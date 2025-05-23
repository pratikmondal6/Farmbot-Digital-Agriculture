const express = require("express");
const login = require("../routes/login");
const signup = require("../routes/signup");
const plant = require("../routes/plantRoutes");
const farmbotConfig = require("../routes/farmbotConfig");
const notFound = require("../routes/notFound");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  app.use("/login", login);
  app.use("/signup", signup);
  app.use("/plant", plant);
  app.use("/api/botConfig", farmbotConfig);
  app.use("*", notFound);
  app.use(error); // we just give reference to this error function
};
