const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Read addresses from shared config
const addressesPath = path.join(__dirname, "../../frontend/contracts/addresses.json");
const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

async function main() {
  const auctionAddress = addresses.Auction;
  const carbonCreditAddress = addresses.CarbonCredit;

  const tokenId = 1;
  const startingBid = hre.ethers.utils.parseEther("1"); // 1 ETH
  const duration = 60; // 60 seconds

  const Auction = await hre.ethers.getContractAt(
    "Auction",
    auctionAddress
  );

  const tx = await Auction.createAuction(
    carbonCreditAddress,
    tokenId,
    startingBid,
    duration
  );

  await tx.wait();

  console.log("Auction created for tokenId:", tokenId);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
