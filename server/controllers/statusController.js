const { getCurrentStatus, getJobStatus } = require('../services/farmbotStatusService');

exports.getStatus = (req, res) => {
    const job = getJobStatus();
    const finalStatus = job && job !== 'online' ? job : getCurrentStatus();
    res.json({ status: finalStatus });
};
