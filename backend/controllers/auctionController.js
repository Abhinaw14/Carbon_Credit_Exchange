const AuctionCache = require('../models/AuctionCache');

// @desc    Get all auctions (with optional status filter)
// @route   GET /api/auctions?status=ACTIVE
// @access  Public
exports.getAuctions = async (req, res) => {
    try {
        const filter = {};

        // Optional status filter: ACTIVE, ENDED, CANCELED
        if (req.query.status) {
            filter.status = req.query.status.toUpperCase();
        }

        const auctions = await AuctionCache.find(filter).sort({ createdAt: -1 });

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

// @desc    Get single auction by auctionId
// @route   GET /api/auctions/:auctionId
// @access  Public
exports.getAuctionById = async (req, res) => {
    try {
        const auction = await AuctionCache.findOne({ auctionId: req.params.auctionId });

        if (!auction) {
            return res.status(404).json({
                success: false,
                error: 'Auction not found'
            });
        }

        res.status(200).json({
            success: true,
            data: auction
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
