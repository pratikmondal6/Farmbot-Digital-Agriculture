const { Farmbot } = require('farmbot');

let currentStatus = 'unknown';
let jobStatus = 'online';

// JWT from your backend or .env (replace if needed)
const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJ1bmtub3duIiwic3ViIjoxNjA1OSwiaWF0IjoxNzUzMzYyMzE3LCJqdGkiOiI4MjdhNTM1Mi1jNmM1LTRiMGEtYjgyOC1jZjFjNDU5Y2U5NDgiLCJpc3MiOiIvL215LmZhcm0uYm90OjQ0MyIsImV4cCI6MTc1ODU0NjMxNywibXF0dCI6ImNsZXZlci1vY3RvcHVzLnJtcS5jbG91ZGFtcXAuY29tIiwiYm90IjoiZGV2aWNlXzE2MDg5Iiwidmhvc3QiOiJ4aWNvbmZ1bSIsIm1xdHRfd3MiOiJ3c3M6Ly9jbGV2ZXItb2N0b3B1cy5ybXEuY2xvdWRhbXFwLmNvbTo0NDMvd3MvbXF0dCJ9.zihNil4fNEcA350gQxjbX0D1CiUbKV1gHplDZ4gvTEd2rIuQyQiMD4RZ5HUerpSlfIlKKVehkuR_Xzlq_KTC-8PpKEJA3pbxgK0M9NVSGPcWg4ydEXXXyRjHr1bbRm_TEPm6r-aEbDKhbNTNJM7dPMJtW-3IKfQRKxS7QKO6JwW35fezXik_YdF7yzR-ioSU3oRkljGzR_d2bmWLlUHB0Dmf2B_YRJjjCDtAkVq5_YW2nnjHAgFxcyHdrYVSwsHklKYbdJc6yWxDkYpXXXMdfRHEvSyJ2hcOOZDR6c5W64Q1FxC6vi7fnXPeA1Me8NlmzDjazmNEk3Dd6V2GI1aY7w';

function setJobStatus(newStatus) {
    jobStatus = newStatus;
}

function getJobStatus() {
    return jobStatus;
}

const bot = new Farmbot({ token: jwt });

bot.on('online', () => {
    // console.log('[FarmBot] ✅ Online event triggered');
    currentStatus = 'online';
});

bot.on('offline', () => {
    // console.log('[FarmBot] ❌ Offline event triggered');
    currentStatus = 'offline';
});



bot.on('error', (err) => {
    console.error('[FarmBot] 🔥 Error:', err.message || err);
    currentStatus = 'error';
});

// Periodically ping device
function verifyDeviceOnline() {
    // console.log('[FarmBot] ⏳ Verifying device ping...');
    bot.ping()
        .then(() => {
            currentStatus = 'online';
            // console.log('[FarmBot] ✅ Ping success');
        })
        .catch((e) => {
            currentStatus = 'offline';
            console.log('[FarmBot] ❌ Ping failed');
        });
}

bot.connect().then(() => {
    console.log('[FarmBot] 🚀 MQTT connected, starting verification loop');
    verifyDeviceOnline();
    setInterval(verifyDeviceOnline, 10000); // every 10s
}).catch((err) => {
    console.error('[FarmBot] ❌ MQTT connection error:', err.message);
    currentStatus = 'error';
});

module.exports = {
    getCurrentStatus: () => currentStatus,
    getJobStatus,
    setJobStatus
};
