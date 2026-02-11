const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
    bidder: { type: String, required: true, lowercase: true },
    amount: { type: String, required: true }, // Store as string to handle large numbers safely
    transactionHash: { type: String },
    timestamp: { type: Date, default: Date.now }
});

const AuctionCacheSchema = new mongoose.Schema({
    auctionId: {
        type: String, // from Blockchain
        required: true,
        unique: true
    },
    tokenId: {
        type: String,
        required: true
    },
    seller: {
        type: String,
        required: true,
        lowercase: true
    },
    highestBid: {
        type: String,
        default: '0'
    },
    highestBidder: {
        type: String,
        lowercase: true
    },
    endTime: {
        type: Number, // Unix timestamp from blockchain
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'ENDED', 'CANCELED'],
        default: 'ACTIVE'
    },
    bids: [BidSchema],
    finalized: {
        type: Boolean,
        default: false
    },
    winner: {
        type: String,
        lowercase: true
    }
}, { timestamps: true });

module.exports = mongoose.model('AuctionCache', AuctionCacheSchema);
