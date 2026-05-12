# Carbon Credit Exchange

A decentralized application (dApp) for a Carbon Credit Auction System. It enables producers of carbon credits to tokenize and auction their assets, while allowing organizations to bid on and purchase these credits transparently on the blockchain.

## Project Architecture

This project is a monorepo structured into three main components:

- **`frontend/`**: The web application built with React and Vite. It allows users (admins, producers, buyers) to interact with the platform.
- **`backend/`**: A Node.js/Express server backed by MongoDB. It caches blockchain data, handles metadata submissions, and serves an API to the frontend for faster querying.
- **`blockchain/`**: The smart contracts (Solidity) and Hardhat development environment. Contains the logic for the ERC721 Carbon Credit tokens and the English Auction system.

---

## Prerequisites

Before running the application locally, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Running locally or via MongoDB Atlas)
- [Git](https://git-scm.com/)
- A Web3 wallet extension like [MetaMask](https://metamask.io/) in your browser.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/carbon-credit-exchange.git
cd carbon-credit-exchange
```

### 2. Smart Contracts Setup (`/blockchain`)

The blockchain directory uses Hardhat to compile, test, and deploy the smart contracts.

```bash
cd blockchain
npm install
```

Start the local Hardhat node in a separate terminal:
```bash
npx hardhat node
```

Deploy the contracts to your local node:
```bash
npx hardhat run scripts/deploy.js --network localhost
# Note down the deployed contract addresses!
```

### 3. Backend Setup (`/backend`)

The backend listens to blockchain events and serves data to the frontend.

```bash
cd ../backend
npm install
```

Configure your environment variables. Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/carbon_exchange
RPC_URL=http://127.0.0.1:8545
CARBON_CREDIT_ADDRESS=<Address of deployed CarbonCredit contract>
AUCTION_ADDRESS=<Address of deployed Auction contract>
```

Start the backend server:
```bash
npm start
# Server will run on http://localhost:5000
```

### 4. Frontend Setup (`/frontend`)

The frontend is a React application built with Vite.

```bash
cd ../frontend
npm install
```

Configure environment variables. Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CARBON_CREDIT_ADDRESS=<Address of deployed CarbonCredit contract>
VITE_AUCTION_ADDRESS=<Address of deployed Auction contract>
```

Start the Vite development server:
```bash
npm run dev
# The app will typically be available at http://localhost:5173
```

---

## Usage Workflow

1. **Connect Wallet:** Use MetaMask to connect your account to the dApp running on `localhost:8545` (Hardhat network).
2. **Submit Credit (Producer):** A producer submits carbon credit metadata via the frontend.
3. **Approve Credit (Admin):** The admin verifies and approves the metadata via the backend. Once approved, the Token is minted on the blockchain.
4. **Create Auction (Admin/Producer):** Put the minted Carbon Credit up for auction.
5. **Place Bids (Buyers):** Other users can connect their wallets and place bids on the active auction.
6. **Finalize Auction:** Once the time expires, finalize the auction to transfer the credit to the highest bidder and funds to the seller.

---

## Tech Stack

- **Frontend:** React, Vite, Ethers.js, Tailwind CSS 
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, Ethers.js
- **Blockchain:** Solidity, Hardhat, Ethers.js

## License

MIT License
