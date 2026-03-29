# 🚀 Carbon Credit Exchange — Demo Guide

## Starting the Project (3 terminals)

```bash
# Terminal 1: Local Blockchain
cd blockchain
npx hardhat node

# Terminal 2: Backend Server
cd backend
npm start

# Terminal 3: Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in Chrome with MetaMask installed.

---

## Step-by-Step Demo Workflow

### 1️⃣ Deploy Smart Contracts
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```
This deploys CarbonCredit + Auction contracts and auto-saves addresses.

---

### 2️⃣ Set Up MetaMask
- Open MetaMask → Add Network:
  - **Network Name:** Hardhat Local
  - **RPC URL:** http://127.0.0.1:8545
  - **Chain ID:** 31337
  - **Currency:** ETH
- Import a Hardhat test account using the private key shown in Terminal 1
- Click **"Connect Wallet"** on the frontend

---

### 3️⃣ Submit a Carbon Credit (Producer Role)
- Go to **Submit Credit** page
- Fill in:
  - Project Name: `Solar Farm Alpha`
  - Location: `Tamil Nadu, India`
  - CO₂ Offset: `150`
  - Vintage: `2025`
- Click **Submit**
- ✅ You'll see a success toast

---

### 4️⃣ Approve the Credit (Admin Role)
- Go to **Admin** page
- You'll see the pending submission
- Click **Approve**
- ✅ Status changes to APPROVED

---

### 5️⃣ Mint the NFT (Producer Role)
- Go to **My Credits** page
- Find the approved submission
- Click **"Mint as NFT"**
- Confirm the MetaMask transaction
- ✅ You'll see Token ID in the "My NFTs" section

---

### 6️⃣ Create an Auction (Producer Role)
- Go to **Create Auction** page
- Select your NFT from the dropdown
- Set starting price: `1` ETH
- Set duration: `5` minutes
- Click **Create Auction**
- Confirm 2 MetaMask transactions (approve + create)
- ✅ Auction is live!

---

### 7️⃣ Place a Bid (Bidder Role)
- Import a **different** Hardhat account in MetaMask (switch accounts)
- Go to **Auctions** page
- You'll see the active auction with a countdown timer
- Click **Place Bid**
- Enter amount higher than starting price (e.g., `2` ETH)
- Confirm MetaMask transaction
- ✅ Bid placed!

---

### 8️⃣ Finalize the Auction (After Timer Ends)
- Wait for the countdown to reach 0
- Switch back to the **seller's account**
- Click **Finalize Auction**
- ✅ NFT transferred to winner, ETH sent to seller

---

## What Each Page Does

| Page | Who Uses It | What It Does |
|------|-------------|-------------|
| **Dashboard** | Everyone | Overview stats + quick links |
| **Submit Credit** | Producer | Submit carbon offset project |
| **My Credits** | Producer | View submissions + mint NFTs |
| **Create Auction** | Producer | Auction owned NFTs |
| **Auctions** | Bidder | Browse + bid on live auctions |
| **Admin** | Admin | Approve/reject submissions |
| **Architecture** | Everyone | How the system works |

---

## Quick API Test (optional)

```bash
# Submit a credit via API
curl -X POST http://localhost:5000/api/credits/submit \
  -H "Content-Type: application/json" \
  -d '{"producer":"0xf39F...","metadata":{"projectName":"Test","location":"India","amount":100,"vintage":"2025"},"documents":[]}'

# View all credits
curl http://localhost:5000/api/credits

# View auctions
curl http://localhost:5000/api/auctions
```
