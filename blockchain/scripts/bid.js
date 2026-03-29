const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Read addresses from shared config
const addressesPath = path.join(__dirname, "../../frontend/contracts/addresses.json");
const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

async function main() {
  const [, bidder] = await hre.ethers.getSigners();

  const auctionAddress = addresses.Auction;
  const auctionId = 1;

  const Auction = await hre.ethers.getContractAt(
    "Auction",
    auctionAddress,
    bidder
  );

  const bidAmount = hre.ethers.utils.parseEther("2");

  const tx = await Auction.placeBid(auctionId, {
    value: bidAmount,
  });

  await tx.wait();

  console.log("Bid placed successfully by:", bidder.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
