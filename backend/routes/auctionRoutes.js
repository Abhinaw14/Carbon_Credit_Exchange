const express = require('express');
const { getAuctions, getAuctionById } = require('../controllers/auctionController');

const router = express.Router();

router.get('/', getAuctions);
router.get('/:auctionId', getAuctionById);

module.exports = router;
