import { ethers } from 'ethers';
import AuctionABI from '../../contracts/AuctionABI.json';
import CarbonCreditABI from '../../contracts/CarbonCreditABI.json';
import addresses from '../../contracts/addresses.json';

export function getProvider() {
    if (!window.ethereum) throw new Error('MetaMask not found');
    return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
    const provider = getProvider();
    return provider.getSigner();
}

export function getCarbonCreditContract(signerOrProvider) {
    return new ethers.Contract(addresses.CarbonCredit, CarbonCreditABI.abi, signerOrProvider);
}

export function getAuctionContract(signerOrProvider) {
    return new ethers.Contract(addresses.Auction, AuctionABI.abi, signerOrProvider);
}

// ---- Carbon Credit Functions ----

export async function mintCarbonCredit(to, metadataURI) {
    const signer = await getSigner();
    const contract = getCarbonCreditContract(signer);
    const tx = await contract.mintCarbonCredit(to, metadataURI);
    const receipt = await tx.wait();
    // Extract tokenId from Transfer event
    const transferEvent = receipt.logs.find(log => {
        try {
            const parsed = contract.interface.parseLog(log);
            return parsed?.name === 'Transfer';
        } catch { return false; }
    });
    let tokenId = null;
    if (transferEvent) {
        const parsed = contract.interface.parseLog(transferEvent);
        tokenId = parsed.args.tokenId.toString();
    }
    return { tx, receipt, tokenId };
}

export async function getOwnedTokens(ownerAddress) {
    const provider = getProvider();
    const contract = getCarbonCreditContract(provider);
    const balance = await contract.balanceOf(ownerAddress);
    const numOwned = Number(balance);
    // Early exit — no tokens owned, skip scanning entirely
    if (numOwned === 0) return [];

    const tokens = [];
    // Scan token IDs until we've found all owned tokens
    for (let i = 1; i <= 200 && tokens.length < numOwned; i++) {
        try {
            const owner = await contract.ownerOf(i);
            if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
                let uri = '';
                try { uri = await contract.tokenURI(i); } catch { }
                tokens.push({ tokenId: i.toString(), owner, uri });
            }
        } catch {
            // Token doesn't exist — skip
        }
    }
    return tokens;
}

// ---- Auction Functions ----

export async function setApprovalForAll() {
    const signer = await getSigner();
    const contract = getCarbonCreditContract(signer);
    const tx = await contract.setApprovalForAll(addresses.Auction, true);
    await tx.wait();
    return tx;
}

export async function createAuction(tokenId, startingBidEth, durationSeconds) {
    const signer = await getSigner();
    const contract = getAuctionContract(signer);
    const startingBid = ethers.parseEther(startingBidEth.toString());
    const tx = await contract.createAuction(
        addresses.CarbonCredit,
        tokenId,
        startingBid,
        durationSeconds
    );
    const receipt = await tx.wait();
    return { tx, receipt };
}

export async function placeBid(auctionId, bidAmountEth) {
    const signer = await getSigner();
    const contract = getAuctionContract(signer);
    const tx = await contract.placeBid(auctionId, {
        value: ethers.parseEther(bidAmountEth.toString()),
    });
    const receipt = await tx.wait();
    return { tx, receipt };
}

export async function finalizeAuction(auctionId) {
    const signer = await getSigner();
    const contract = getAuctionContract(signer);
    const tx = await contract.finalizeAuction(auctionId);
    const receipt = await tx.wait();
    return { tx, receipt };
}

export async function getAuctionOnChain(auctionId) {
    const provider = getProvider();
    const contract = getAuctionContract(provider);
    const auction = await contract.auctions(auctionId);
    return {
        seller: auction.seller,
        nftContract: auction.nftContract,
        tokenId: auction.tokenId.toString(),
        highestBid: ethers.formatEther(auction.highestBid),
        highestBidder: auction.highestBidder,
        endTime: Number(auction.endTime),
        finalized: auction.finalized,
    };
}

export { addresses };
