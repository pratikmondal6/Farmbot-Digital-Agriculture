const { getCurrentStatus } = require('../services/farmbotStatusService');

exports.getStatus = (req, res) => {
    res.send({ status: getCurrentStatus() });
};
