const { ethers } = require('ethers');
const dotenv = require('dotenv');
const auctionArtifact = require('./abis/Auction.json');
const carbonCreditArtifact = require('./abis/CarbonCredit.json');

dotenv.config();

const provider = new ethers.WebSocketProvider(process.env.RPC_URL);

// Contract Instances
// Note: We only need read/listener access here, so provider is enough.
// If backend needs to write (e.g. admin actions), we would need a Wallet.
const auctionContract = new ethers.Contract(
    process.env.AUCTION_ADDRESS,
    auctionArtifact.abi,
    provider
);

const carbonCreditContract = new ethers.Contract(
    process.env.CARBON_CREDIT_ADDRESS,
    carbonCreditArtifact.abi,
    provider
);

module.exports = {
    provider,
    auctionContract,
    carbonCreditContract
};
