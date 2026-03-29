const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // 1) Deploy CarbonCredit
  const CarbonCredit = await hre.ethers.getContractFactory("CarbonCredit");
  const carbonCredit = await CarbonCredit.deploy(deployer.address);
  await carbonCredit.deployed();

  console.log("CarbonCredit deployed to:", carbonCredit.address);

  // 2) Deploy Auction
  const Auction = await hre.ethers.getContractFactory("Auction");
  const auction = await Auction.deploy();
  await auction.deployed();

  console.log("Auction deployed to:", auction.address);

  // 3) Auto-save addresses to frontend/contracts/addresses.json
  const addressesData = {
    CarbonCredit: carbonCredit.address,
    Auction: auction.address,
    chainId: (await deployer.provider.getNetwork()).chainId,
    network: "Hardhat Local"
  };

  const frontendPath = path.join(__dirname, "../../frontend/contracts/addresses.json");
  fs.writeFileSync(frontendPath, JSON.stringify(addressesData, null, 2));
  console.log("Addresses saved to frontend/contracts/addresses.json");

  // 4) Auto-update backend .env with new addresses
  const envPath = path.join(__dirname, "../../backend/.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");

    // Replace or add CARBON_CREDIT_ADDRESS
    if (envContent.includes("CARBON_CREDIT_ADDRESS=")) {
      envContent = envContent.replace(
        /CARBON_CREDIT_ADDRESS=.*/,
        `CARBON_CREDIT_ADDRESS=${carbonCredit.address}`
      );
    } else {
      envContent += `\nCARBON_CREDIT_ADDRESS=${carbonCredit.address}`;
    }

    // Replace or add AUCTION_ADDRESS
    if (envContent.includes("AUCTION_ADDRESS=")) {
      envContent = envContent.replace(
        /AUCTION_ADDRESS=.*/,
        `AUCTION_ADDRESS=${auction.address}`
      );
    } else {
      envContent += `\nAUCTION_ADDRESS=${auction.address}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log("Backend .env updated with new addresses");
  }

  console.log("Deployment completed successfully.");
}

// Hardhat recommended pattern
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
