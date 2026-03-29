const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Read addresses from shared config
const addressesPath = path.join(__dirname, "../../frontend/contracts/addresses.json");
const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

async function main() {
  const auctionAddress = addresses.Auction;
  const auctionId = 1; // first auction

  const Auction = await hre.ethers.getContractAt(
    "Auction",
    auctionAddress
  );

  const tx = await Auction.finalizeAuction(auctionId);
  await tx.wait();

  console.log("Auction finalized successfully for auctionId:", auctionId);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
