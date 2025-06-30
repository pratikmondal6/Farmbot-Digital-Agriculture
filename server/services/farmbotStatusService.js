const { Farmbot } = require('farmbot');

let currentStatus = 'unknown';
let jobStatus = 'online';

// JWT from your backend or .env (replace if needed)
const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJ1bmtub3duIiwic3ViIjoyODIzOCwiaWF0IjoxNzQ5MDM2MzgxLCJqdGkiOiIwZGYyZDE5OS00ZDA3LTQ2YmQtOTBhMy00OGQ3NGVkMzBhZGUiLCJpc3MiOiIvL215LmZhcm0uYm90OjQ0MyIsImV4cCI6MTc1NDIyMDM4MSwibXF0dCI6ImNsZXZlci1vY3RvcHVzLnJtcS5jbG91ZGFtcXAuY29tIiwiYm90IjoiZGV2aWNlXzI4MzQ2Iiwidmhvc3QiOiJ4aWNvbmZ1bSIsIm1xdHRfd3MiOiJ3c3M6Ly9jbGV2ZXItb2N0b3B1cy5ybXEuY2xvdWRhbXFwLmNvbTo0NDMvd3MvbXF0dCJ9.UctEHN2DutPDRp4KWSXPasaldkeoZsO8uNWOabDzBBiduGEWnfWKvrzHoxwjuYU3dbNI88RvIzuBrNvZ_r6O1GNYIsalXsvURlmOBi9cvZKpBS8MAVKQsCYHD_YhJ_6dmtFd-6PlzGQh-Uk28qWDuOK637ZnbwU4GNAc9r-MuJ1IXA4edK8LtQ7exl6pa7v8euU3tZ05qC1QTeAZ3QwtAy3vt_p0jnd74u03bxTfI9jDxnJcfn3edzHjJApxWDtuFNrfh1m5CsPj1R9cghnkyBJlWu8t10qoA5Y_oGEoCBAMDdH-Wckw64swNaQl3AxPrFz0NamPOwnXQgn5XavECQ';

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
