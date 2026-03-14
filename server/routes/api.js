const router = require('express').Router();
const gtfsController = require('../controllers/gtfsController');
const dashboardController = require('../controllers/dashboardController');

router.get('/vehicles', gtfsController.getVehiclePositions);
router.get('/dashboard', dashboardController.getDashboardStats);
router.post('/dashboard/generate', dashboardController.generateForecasts);

module.exports = router;
