const express = require('express');

const router = express.Router();
const config = require('config')
const farmbotURL = config.get('farmbotUrl')

router.put("/", async (req, res) => {
    function responseHandler(statusCode, error, data) {
        return res.status(statusCode).json({error: error, data: data});
    }
    let token = req.headers["authorization"];

    try {
        if (!token) {
            return res.status(401).json({message: 'Authorization token is required'});
        }

        if (!req.body) {
            return res.status(400).json({message: 'Request body is required'});
        }

        const configData = req.body;

        console.log(configData)

        const deviceReqJSON = {
            name: configData.name || null,
            fb_order_number: configData.orderNumber || null,
            timezone: configData.timezone || null,
            lat: configData.location?.lat || null,
            lng: configData.location?.long || null,
            indoor: configData.indoor || false,
            ota_hour: configData.autoUpdate || null,
            fbos_version: configData.os?.version || null,
            rpi: configData.raspberryPiModel || null
        };


        const fbOSReqJSON = {
            boot_sequence_id: configData.bootSequence || null,
            firmware_hardware: configData.firmware || null,
            firmware_path: configData.firmwarePath || null
        };

        const deviceResponse = await fetch(`${farmbotURL}/api/device`, {
            method: 'PATCH',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deviceReqJSON)
        });

        const fbOSResponse = await fetch(`${farmbotURL}/api/fbos_config`, {
            method: 'PATCH',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fbOSReqJSON)
        });

        const deviceData = await deviceResponse.json();
        const fbOSData = await fbOSResponse.json();

        if (deviceResponse.status === 401 || fbOSResponse.status === 401) {
            return responseHandler(deviceResponse.status, {
                message: "Unauthorized: Please enter valid token",
                code: "FBOT_CONFIG_401"
            }, null);
        }
        const responseData = generateResponse(deviceData, fbOSData);

        return responseHandler(200, null, responseData);

    } catch (error) {
        console.error('Error fetching device data:', error);
        return responseHandler(500, {
            message: error.message || 'An unexpected error occurred',
            code: "FBOT_CONFIG_501"
        }, null);
    }
});

router.get("/", async (req, res) => {
    function responseHandler(statusCode, error, data) {
        return res.status(statusCode).json({error: error, data: data});
    }

    try {
        let token = req.headers["authorization"];

        if (!token) {
            return res.status(401).json({message: 'Authorization token is required'});
        }

        const deviceResponse = await fetch(`${farmbotURL}/api/device`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        const fbOSResponse = await fetch(`${farmbotURL}/api/fbos_config`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        const deviceData = await deviceResponse.json();
        const fbOSData = await fbOSResponse.json();

        if (deviceResponse.status === 401 || fbOSResponse.status === 401) {
            return responseHandler(deviceResponse.status, {
                message: "Unauthorized: Please enter valid token",
                code: "FBOT_CONFIG_401"
            }, null);
        }
        const responseData = generateResponse(deviceData, fbOSData);

        return responseHandler(200, null, responseData);

    } catch (error) {
        console.error('Error fetching device data:', error);
        return responseHandler(500, {
            message: error.message || 'An unexpected error occurred',
            code: "FBOT_CONFIG_501"
        }, null);
    }
});

function generateResponse(deviceData, fbOSData) {
    return {
        name: deviceData.name || '',
        orderNumber: deviceData.fb_order_number || '',
        timezone: deviceData.timezone || '',
        location: {
            lat: deviceData.lat || '',
            long: deviceData.lng || '',
        },
        indoor: deviceData.indoor || false,
        autoUpdate: deviceData.ota_hour || '',
        os: {
            version: deviceData.fbos_version || '',
            isUpdateAvailable: false,
            releaseNotes: '',
            updateUrl: '',
        },
        bootSequence: fbOSData.boot_sequence_id || '',
        firmware: fbOSData.firmware_hardware || '',
        firmwarePath: fbOSData.firmware_path || '',
        raspberryPiModel: deviceData.rpi || '',
    };
}

module.exports = router;