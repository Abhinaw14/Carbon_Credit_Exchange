const { auctionContract } = require('../config/blockchain');
const AuctionCache = require('../models/AuctionCache');

const setupEventListeners = () => {
    console.log('Setting up Blockchain Event Listeners...');

    // 1. Listen to AuctionCreated
    auctionContract.on('AuctionCreated', async (auctionId, seller, tokenId, endTime, event) => {
        console.log(`Event: AuctionCreated - ID: ${auctionId}, Seller: ${seller}, Token: ${tokenId}`);
        try {
            await AuctionCache.create({
                auctionId: auctionId.toString(),
                tokenId: tokenId.toString(),
                seller: seller.toLowerCase(),
                endTime: Number(endTime),
                status: 'ACTIVE',
                highestBid: '0',
                bids: []
            });
            console.log(`Auction ${auctionId} cached successfully.`);
        } catch (err) {
            console.error('Error caching auction creation:', err);
        }
    });

    // 2. Listen to BidPlaced
    auctionContract.on('BidPlaced', async (auctionId, bidder, amount, event) => {
        console.log(`Event: BidPlaced - ID: ${auctionId}, Bidder: ${bidder}, Amount: ${amount}`);
        try {
            const auction = await AuctionCache.findOne({ auctionId: auctionId.toString() });
            if (auction) {
                auction.highestBid = amount.toString();
                auction.highestBidder = bidder.toLowerCase();
                auction.bids.push({
                    bidder: bidder.toLowerCase(),
                    amount: amount.toString(),
                    timestamp: new Date()
                });
                await auction.save();
                console.log(`Bid on Auction ${auctionId} recorded.`);
            } else {
                console.warn(`Auction ${auctionId} not found in cache.`);
            }
        } catch (err) {
            console.error('Error recording bid:', err);
        }
    });

    // 3. Listen to AuctionFinalized
    auctionContract.on('AuctionFinalized', async (auctionId, winner, amount, event) => {
        console.log(`Event: AuctionFinalized - ID: ${auctionId}, Winner: ${winner}, Amount: ${amount}`);
        try {
            const auction = await AuctionCache.findOne({ auctionId: auctionId.toString() });
            if (auction) {
                auction.status = 'ENDED';
                auction.finalized = true;
                auction.winner = winner.toLowerCase(); // winner is the 2nd arg in event
                // amount is the 3rd arg, which matches highestBid
                await auction.save();
                console.log(`Auction ${auctionId} finalized.`);
            } else {
                console.warn(`Auction ${auctionId} not found in cache.`);
            }
        } catch (err) {
            console.error('Error finalizing auction:', err);
        }
    });
};

module.exports = setupEventListeners;
