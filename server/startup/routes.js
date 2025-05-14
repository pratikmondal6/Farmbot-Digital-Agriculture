const express = require("express");
const notFound = require("../routes/notFound");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  app.use("*", notFound);
  app.use(error); // we just give refrence to this error function
};
