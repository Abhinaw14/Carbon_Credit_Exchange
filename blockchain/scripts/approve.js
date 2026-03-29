const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Read addresses from shared config
const addressesPath = path.join(__dirname, "../../frontend/contracts/addresses.json");
const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

async function main() {
  const carbonCreditAddress = addresses.CarbonCredit;
  const auctionAddress = addresses.Auction;

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
