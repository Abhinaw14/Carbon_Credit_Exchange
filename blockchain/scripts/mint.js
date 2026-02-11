const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const carbonCreditAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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
