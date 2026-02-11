# Carbon Credit Exchange Backend

Node.js/Express backend for the Carbon Credit Auction System.

## Prerequisites

- Node.js (v14+)
- MongoDB (Running locally or cloud)
- Blockchain Provider (Hardhat node or Testnet)

## Setup

1.  **Install Dependencies:**
    ```bash
    cd backend
    npm install
    ```

2.  **Configuration:**
    - Copy the `contracts` ABIs to `config/abis/` (Automated during setup).
    - Update `.env` with your MongoDB URI and Blockchain RPC URL.
    - **Crucial:** Update `CARBON_CREDIT_ADDRESS` and `AUCTION_ADDRESS` in `.env` with your deployed contract addresses.

3.  **Run Server:**
    ```bash
    npm start
    # OR for dev with hot reload (if nodemon installed)
    # npx nodemon index.js
    ```

## API Endpoints

### Credits
- `POST /api/credits/submit`: Submit new credit metadata (Producer).
- `GET /api/credits/pending`: Get pending submissions (Admin).
- `PATCH /api/credits/:id/approve`: Approve a submission (Admin).

### Auctions
- `GET /api/auctions`: Get all auctions (Public).

## Services
- **Event Listener:** Automatically listens to `AuctionCreated`, `BidPlaced`, `AuctionFinalized` on the blockchain and updates the MongoDB cache.
