const { auctionContract } = require('../config/blockchain');
const AuctionCache = require('../models/AuctionCache');

let lastCheckedBlock = 0;

const setupEventListeners = async () => {
    console.log('Setting up Blockchain Event Listeners (polling mode)...');

    // Get current block as starting point
    try {
        const provider = auctionContract.runner.provider;
        lastCheckedBlock = await provider.getBlockNumber();
        console.log(`Starting event poll from block ${lastCheckedBlock}`);
    } catch (err) {
        console.error('Failed to get block number:', err.message);
    }

    // Poll every 3 seconds for new events
    setInterval(async () => {
        try {
            const provider = auctionContract.runner.provider;
            const currentBlock = await provider.getBlockNumber();

            if (currentBlock <= lastCheckedBlock) return;

            const fromBlock = lastCheckedBlock + 1;
            const toBlock = currentBlock;

            // Query AuctionCreated events
            const createdEvents = await auctionContract.queryFilter('AuctionCreated', fromBlock, toBlock);
            for (const event of createdEvents) {
                const { auctionId, seller, tokenId, endTime } = event.args;
                console.log(`Event: AuctionCreated - ID: ${auctionId}, Seller: ${seller}, Token: ${tokenId}`);
                try {
                    await AuctionCache.findOneAndUpdate(
                        { auctionId: auctionId.toString() },
                        {
                            auctionId: auctionId.toString(),
                            tokenId: tokenId.toString(),
                            seller: seller.toLowerCase(),
                            endTime: Number(endTime),
                            status: 'ACTIVE',
                            highestBid: '0',
                            bids: []
                        },
                        { upsert: true, new: true }
                    );
                    console.log(`Auction ${auctionId} cached successfully.`);
                } catch (err) {
                    console.error('Error caching auction:', err.message);
                }
            }

            // Query BidPlaced events
            const bidEvents = await auctionContract.queryFilter('BidPlaced', fromBlock, toBlock);
            for (const event of bidEvents) {
                const { auctionId, bidder, amount } = event.args;
                console.log(`Event: BidPlaced - ID: ${auctionId}, Bidder: ${bidder}, Amount: ${amount}`);
                try {
                    const auction = await AuctionCache.findOne({ auctionId: auctionId.toString() });
                    if (auction) {
                        auction.highestBid = amount.toString();
                        auction.highestBidder = bidder.toLowerCase();
                        auction.bids.push({
                            bidder: bidder.toLowerCase(),
                            amount: amount.toString(),
                            transactionHash: event.transactionHash,
                            timestamp: new Date()
                        });
                        await auction.save();
                        console.log(`Bid on Auction ${auctionId} recorded.`);
                    }
                } catch (err) {
                    console.error('Error recording bid:', err.message);
                }
            }

            // Query AuctionFinalized events
            const finalizedEvents = await auctionContract.queryFilter('AuctionFinalized', fromBlock, toBlock);
            for (const event of finalizedEvents) {
                const { auctionId, winner, amount } = event.args;
                console.log(`Event: AuctionFinalized - ID: ${auctionId}, Winner: ${winner}`);
                try {
                    const auction = await AuctionCache.findOne({ auctionId: auctionId.toString() });
                    if (auction) {
                        auction.status = 'ENDED';
                        auction.finalized = true;
                        auction.winner = winner.toLowerCase();
                        await auction.save();
                        console.log(`Auction ${auctionId} finalized.`);
                    }
                } catch (err) {
                    console.error('Error finalizing auction:', err.message);
                }
            }

            lastCheckedBlock = toBlock;
        } catch (err) {
            console.error('Event polling error:', err.message);
        }
    }, 3000);
};

module.exports = setupEventListeners;
