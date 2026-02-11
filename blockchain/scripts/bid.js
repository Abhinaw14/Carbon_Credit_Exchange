const hre = require("hardhat");

async function main() {
  const [, bidder] = await hre.ethers.getSigners();

  const auctionAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
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
