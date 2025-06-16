const express = require("express");
const login = require("../routes/login");
const signup = require("../routes/signup");
const plant = require("../routes/plantRoutes");
const farmbotConfig = require("../routes/farmbotConfig");
const statusRoutes = require("../routes/statusRoutes");
const seedingJob = require("../routes/seedingJob");
const farmbotPosition = require("../routes/farmbotPosition");
const notFound = require("../routes/notFound");
const moveFarmbot = require("../routes/moveFarmbot");
const moveRelative = require("../routes/moveRelative");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  app.use("/login", login);
  app.use("/signup", signup);
  app.use("/plant", plant);
  app.use("/move", moveFarmbot);
  app.use("/moveRelative", moveRelative);
  app.use("/seedingJob", seedingJob);
  app.use('/farmbotPosition', farmbotPosition);
  app.use("/api/botConfig", farmbotConfig);
  app.use('/api/status', statusRoutes);
  app.use("*", notFound);
  app.use(error); // we just give reference to this error function
};
