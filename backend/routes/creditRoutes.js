const express = require('express');
const { submitCredit, getPendingCredits, approveCredit } = require('../controllers/creditController');

const router = express.Router();

router.post('/submit', submitCredit);
router.get('/pending', getPendingCredits);
router.patch('/:id/approve', approveCredit);

module.exports = router;
