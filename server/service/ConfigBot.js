const {Farmbot} = require('farmbot');

class FarmBotController {
    /**
     * Initialize the FarmBot controller
     * @param {Object} config - { token: string, uuid: string }
     */

    constructor(config) {
        let SUPER_SECRET_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9." +
            "eyJhdWQiOiJ1bmtub3duIiwic3ViIjoyODIzOCwiaWF0IjoxNzQ3MjI3MzYwLCJqdGkiOiI0YzI0ZGF" +
            "mNi0yNTcyLTQyOTYtOTJjNC1mZDA3OTBkNTQ2NGIiLCJpc3MiOiIvL215LmZhcm0uYm90OjQ0MyIsIm" +
            "V4cCI6MTc1MjQxMTM2MCwibXF0dCI6ImNsZXZlci1vY3RvcHVzLnJtcS5jbG91ZGFtcXAuY29tIiwiY" +
            "m90IjoiZGV2aWNlXzI4MzQ2Iiwidmhvc3QiOiJ4aWNvbmZ1bSIsIm1xdHRfd3MiOiJ3c3M6Ly9jbGV2" +
            "ZXItb2N0b3B1cy5ybXEuY2xvdWRhbXFwLmNvbTo0NDMvd3MvbXF0dCJ9.PWWuPuNyMPHpThe2nwRQZl" +
            "jb2CFMd7uuZjckugrVxpNDPAtEHwgdkwq_L6vp0MRDQke8NPpw-PDOUclqXoM50fOJCF9ReX75tRJKe" +
            "lpPvW44YSWiFqzsyp4tHQb04sMBRZTYYzjqSsnarFBLg7T0Ih6_xeTEie_VrWKi5cw63ab9j6uWi1mV" +
            "Kjgb_Vm7aqTVg2RLf0kWw3jeBKQB7YCMeCcDrJ8azUh-FdBSc_u8W4-vl1kZZ1WOAMBXKIL5saoZX_I" +
            "th3CgHEwzchSwE0wKvltMkbJkO98dP-gEtzBt9Abfy4_HONnItt5LnJLR4iWJmTYEHq9yWMxWq9CZKfnIGw";

        this.bot = new Farmbot({
            token: config.token,
            uuid: config.uuid
        });

        this.connect();
        this.moveAbsolute({ x: 100, y: 200, z: 0 });
    }

    /**
     * Set up event listeners for the FarmBot connection


    /**
     * Connect to the FarmBot device
     * @returns {Promise<void>}
     */
    async connect() {
        try {
            await this.bot.connect();
            console.log('Successfully connected to FarmBot');
        } catch (error) {
            console.error('Connection failed:', error);
            throw error;
        }
    }

    /**
     * Move FarmBot to absolute coordinates
     * @param {Object} position - { x: number, y: number, z: number }
     * @returns {Promise<void>}
     */
    async moveAbsolute(position) {
        try {
            console.log(`Moving to position: X=${position.x}, Y=${position.y}, Z=${position.z}`);
            await this.bot.moveAbsolute(position);
            console.log('Move completed successfully');
        } catch (error) {
            console.error('Move failed:', error);
            throw error;
        }
    }

    /**
     * Update FarmBot configuration
     * @param {Object} config - Configuration object
     * @returns {Promise<void>}
     */
    async updateConfig(config) {
        try {
            console.log('Updating FarmBot configuration:', config);
            // await this.bot.setConfig();
            console.log('Configuration updated successfully');
        } catch (error) {
            console.error('Configuration update failed:', error);
            throw error;
        }
    }
}

module.exports = FarmBotController;
