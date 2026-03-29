const { ethers } = require('ethers');
const dotenv = require('dotenv');
const auctionArtifact = require('./abis/Auction.json');
const carbonCreditArtifact = require('./abis/CarbonCredit.json');

dotenv.config();

// Use HTTP JsonRpcProvider — more reliable with Hardhat node
const RPC_URL = process.env.RPC_URL.replace('ws://', 'http://').replace('wss://', 'https://');

const provider = new ethers.JsonRpcProvider(RPC_URL);

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

console.log('Blockchain provider connected to:', RPC_URL);
console.log('Auction contract:', process.env.AUCTION_ADDRESS);
console.log('CarbonCredit contract:', process.env.CARBON_CREDIT_ADDRESS);

module.exports = { provider, auctionContract, carbonCreditContract };
