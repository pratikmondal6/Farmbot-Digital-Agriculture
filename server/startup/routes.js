const express = require("express");
const login = require("../routes/login");
const signup = require("../routes/signup");
const plant = require("../routes/plantRoutes");
const farmbotConfig = require("../routes/farmbotConfig");
const statusRoutes = require("../routes/statusRoutes");
const seedingJob = require("../routes/seedingJob");
const farmbotPosition = require("../services/farmbotPosition");
const { handleScheduledSeedingJobs } = require("../services/handleScheduledSeedingJobs");
const notFound = require("../routes/notFound");
const moveFarmbot = require("../routes/moveFarmbot");
const moveRelative = require("../routes/moveRelative");
const error = require("../middleware/error");
const wateringJob = require('../routes/wateringJob');
const occupiedAreas = require("../routes/occupied-areas");
const soilHumidity = require("../routes/soilHumidity");
const areaHumidity = require("../routes/areaHumidity");


module.exports = function (app) {
  app.use(express.json());
  app.use("/login", login);
  app.use("/signup", signup);
  app.use("/plant", plant);
  app.use("/move", moveFarmbot);
  app.use("/moveRelative", moveRelative);
  app.use("/seedingJob", seedingJob);
  farmbotPosition.updatePosition()
  app.use('/farmbotPosition', farmbotPosition.router);
  app.use("/api/botConfig", farmbotConfig);
  app.use('/api/status', statusRoutes);
  app.use('/api/watering', wateringJob);
  app.use('/api/soilHumidity', soilHumidity);
  app.use('/api/areaHumidity', areaHumidity);
  handleScheduledSeedingJobs()
  app.use("*", notFound);
  app.use(error); // we just give reference to this error function
  app.use("/api/seeds", occupiedAreas);

};
