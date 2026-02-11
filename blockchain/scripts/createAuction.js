const hre = require("hardhat");

async function main() {
  const auctionAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const carbonCreditAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const tokenId = 1;
  const startingBid = hre.ethers.utils.parseEther("1"); // 1 ETH
  const duration = 60; // 5 minutes

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
