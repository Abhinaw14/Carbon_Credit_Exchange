const hre = require("hardhat");

async function main() {
  const auctionAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
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
