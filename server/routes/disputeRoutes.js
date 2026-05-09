const router = require('express').Router();
const { createDispute } = require('../controllers/disputeController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createDispute);

module.exports = router;
