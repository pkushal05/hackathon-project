const GTFSService = require('../services/GTFSService');

exports.getVehiclePositions = async (req, res, next) => {
  try {
    const vehicles = await GTFSService.getEnrichedVehiclePositions();
    res.json({ success: true, data: vehicles });
  } catch (err) { next(err); }
};
