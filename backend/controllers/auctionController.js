const AuctionCache = require('../models/AuctionCache');

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Public
exports.getAuctions = async (req, res) => {
    try {
        const auctions = await AuctionCache.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: auctions.length,
            data: auctions
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
