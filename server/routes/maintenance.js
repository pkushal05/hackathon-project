const router = require('express').Router();
const c = require('../controllers/maintenanceController');
router.get('/', c.getAll);
router.get('/health', c.getHealthSummary);
router.get('/:id', c.getById);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
module.exports = router;
