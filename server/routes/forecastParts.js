const router = require('express').Router();
const c = require('../controllers/forecastPartsController');
router.get('/', c.getAll);
router.post('/generate', c.generate);
router.delete('/:id', c.remove);
module.exports = router;
