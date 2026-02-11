const express = require('express');
const { getAuctions } = require('../controllers/auctionController');

const router = express.Router();

router.get('/', getAuctions);

module.exports = router;
