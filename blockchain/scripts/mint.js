const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Read addresses from shared config
const addressesPath = path.join(__dirname, "../../frontend/contracts/addresses.json");
const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const carbonCreditAddress = addresses.CarbonCredit;

  const CarbonCredit = await hre.ethers.getContractAt(
    "CarbonCredit",
    carbonCreditAddress
  );

  const metadataURI = "ipfs://sample-carbon-credit-metadata";

  const tx = await CarbonCredit.mintCarbonCredit(
    deployer.address,
    metadataURI
  );

  await tx.wait();

  console.log("Carbon credit minted successfully");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
