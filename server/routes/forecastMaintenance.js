const router = require('express').Router();
const c = require('../controllers/forecastMaintenanceController');
router.get('/', c.getAll);
router.post('/generate', c.generate);
router.delete('/:id', c.remove);
module.exports = router;
