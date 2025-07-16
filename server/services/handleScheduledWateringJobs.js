const express = require("express");
const { Farmbot } = require("farmbot");
const router = express.Router();
const axios = require("axios")
const WateringJob = require("../models/watering");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startWateringJob(wateringJob, token) {
  await axios.post(
    "http://localhost:5001/api/watering/start",
    wateringJob,                 // <-- request body (data)
    {
      headers: {
        "auth-token": token        // <-- headers go here
      }
    }
  );
}

const handleScheduledWateringJobs = async () => {
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJ1bmtub3duIiwic3ViIjoxNjA1OSwiaWF0IjoxNzUwODY3MjI4LCJqdGkiOiIzNDVlY2RiMC02MDc0LTQ4NWItYmQ2MC02ZmFjNWE2ZmYxN2IiLCJpc3MiOiIvL215LmZhcm0uYm90OjQ0MyIsImV4cCI6MTc1NjA1MTIyOCwibXF0dCI6ImNsZXZlci1vY3RvcHVzLnJtcS5jbG91ZGFtcXAuY29tIiwiYm90IjoiZGV2aWNlXzE2MDg5Iiwidmhvc3QiOiJ4aWNvbmZ1bSIsIm1xdHRfd3MiOiJ3c3M6Ly9jbGV2ZXItb2N0b3B1cy5ybXEuY2xvdWRhbXFwLmNvbTo0NDMvd3MvbXF0dCJ9.cRXp3tVyO9UYCPtfTyVBAnaFTB261BJDSIxNftlw68v_XBLOOZ7OSqzUPBudyQJRCI0FSVrkmWokKDyF_hVMwDHGd19wZanMB8PNQOrhRfQxeD00CP4vMENhpI_2W8uzynqPanWy-gbNaOeyrV5FEDjHnjlWlXE8v2tSvhXMHaSdRq7UM_GpTkfvr5b3ixrRByGTFKZFvuZJ2k9OrFPRym1aXRdE-4IrM7vwzlFhEDlC2prINIaGa3wq3YGfJXeJrls5H38Gj5tdfcmAdk0qYKGftKbQwj45pWUMns4LKNtgEmmms5dV0PLLh2v8sZ8ATqTSaDFtvreopxcHq8kZnQ"
  const bot = new Farmbot({ token });
  bot.connect()
  while (true) {
    const wateringJobs = await WateringJob.find();
    console.log("Watering jobs:")
    console.log(wateringJobs)

    const now = Date.now()
    for (let wateringJob of wateringJobs) {
      const firstExecutionDate = new Date(wateringJob.date).getTime()
      // console.log(firstExecutionDate)
      // console.log(now)

      if (wateringJob.lastWateredDate == "" && firstExecutionDate < now) {
        console.log("Need to water for the first time")
        console.log(wateringJob)
        await startWateringJob(wateringJob, token)
        wateringJob.lastWateredDate = now
        await wateringJob.save()
      }

      else if (wateringJob.lastWateredDate != "" && parseInt(wateringJob.lastWateredDate)+(parseInt(wateringJob.interval)*3600000) < now) {
        console.log("Need to water")
        console.log(wateringJob)
        await startWateringJob(wateringJob, token)
        wateringJob.lastWateredDate = now
        await wateringJob.save()
      }
    }

    await sleep(30000)

  }
}

module.exports = {
  handleScheduledWateringJobs
}
