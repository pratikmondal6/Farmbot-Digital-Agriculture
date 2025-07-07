const express = require("express");
const { Farmbot } = require("farmbot");
const router = express.Router();
const axios = require("axios")

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const handleScheduledSeedingJobs = async () => {
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJ1bmtub3duIiwic3ViIjoxNjA1OSwiaWF0IjoxNzUwODY3MjI4LCJqdGkiOiIzNDVlY2RiMC02MDc0LTQ4NWItYmQ2MC02ZmFjNWE2ZmYxN2IiLCJpc3MiOiIvL215LmZhcm0uYm90OjQ0MyIsImV4cCI6MTc1NjA1MTIyOCwibXF0dCI6ImNsZXZlci1vY3RvcHVzLnJtcS5jbG91ZGFtcXAuY29tIiwiYm90IjoiZGV2aWNlXzE2MDg5Iiwidmhvc3QiOiJ4aWNvbmZ1bSIsIm1xdHRfd3MiOiJ3c3M6Ly9jbGV2ZXItb2N0b3B1cy5ybXEuY2xvdWRhbXFwLmNvbTo0NDMvd3MvbXF0dCJ9.cRXp3tVyO9UYCPtfTyVBAnaFTB261BJDSIxNftlw68v_XBLOOZ7OSqzUPBudyQJRCI0FSVrkmWokKDyF_hVMwDHGd19wZanMB8PNQOrhRfQxeD00CP4vMENhpI_2W8uzynqPanWy-gbNaOeyrV5FEDjHnjlWlXE8v2tSvhXMHaSdRq7UM_GpTkfvr5b3ixrRByGTFKZFvuZJ2k9OrFPRym1aXRdE-4IrM7vwzlFhEDlC2prINIaGa3wq3YGfJXeJrls5H38Gj5tdfcmAdk0qYKGftKbQwj45pWUMns4LKNtgEmmms5dV0PLLh2v8sZ8ATqTSaDFtvreopxcHq8kZnQ"
  const bot = new Farmbot({ token });
  bot.connect()
  while (true) {
    const response = await axios.get('http://localhost:5001/seedingJob/seedingJobs');
    seedingJobs = response.data
    // console.log("Seeding jobs:")
    // console.log(seedingJobs)

    for (let seedingJob of seedingJobs) {
      // Convert to Date object
      const dateObj = new Date(seedingJob.seeding_date);
      // Get timestamp in milliseconds
      const timestamp = dateObj.getTime();

      if (timestamp <= Date.now()) {
        console.log("Seeding job to start:")
        console.log(seedingJob)
        await axios.post(
          "http://localhost:5001/seedingJob/start",
          { ...seedingJob },                 // <-- request body (data)
          {
            headers: {
              "auth-token": token        // <-- headers go here
            }
          }
        );
        await axios.delete("http://localhost:5001/seedingJob/" + seedingJob._id, {
          headers: {
            "Auth-Token": token,
          }
        })
      }
    }

    await sleep(60000)

  }
}

module.exports = {
  handleScheduledSeedingJobs
}
