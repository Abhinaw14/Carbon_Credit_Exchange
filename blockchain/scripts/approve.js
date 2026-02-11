const hre = require("hardhat");

async function main() {
  const carbonCreditAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const auctionAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const CarbonCredit = await hre.ethers.getContractAt(
    "CarbonCredit",
    carbonCreditAddress
  );

  const tx = await CarbonCredit.setApprovalForAll(auctionAddress, true);
  await tx.wait();

  console.log("Auction contract approved for ALL carbon credits");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
