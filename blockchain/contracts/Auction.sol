// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title Auction
 * @dev English auction contract for CarbonCredit NFTs
 */
contract Auction is ReentrancyGuard {

    struct AuctionItem {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool finalized;
    }

    uint256 public auctionCount;

    mapping(uint256 => AuctionItem) public auctions;

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        uint256 tokenId,
        uint256 endTime
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );

    event AuctionFinalized(
        uint256 indexed auctionId,
        address winner,
        uint256 amount
    );

    /**
     * @dev Create a new auction
     */
    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startingBid,
        uint256 duration
    ) external {
        require(duration > 0, "Invalid duration");

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        auctionCount++;

        auctions[auctionCount] = AuctionItem({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            highestBid: startingBid,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            finalized: false
        });

        emit AuctionCreated(auctionCount, msg.sender, tokenId, block.timestamp + duration);
    }

    /**
     * @dev Place a bid (payable)
     */
    function placeBid(uint256 auctionId) external payable nonReentrant {
        AuctionItem storage auction = auctions[auctionId];

        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");

        // Refund previous bidder
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    /**
     * @dev Finalize auction and transfer ownership
     */
    function finalizeAuction(uint256 auctionId) external nonReentrant {
    AuctionItem storage auction = auctions[auctionId];

    require(block.timestamp >= auction.endTime, "Auction not ended");
    require(!auction.finalized, "Already finalized");

    auction.finalized = true;

    if (auction.highestBidder != address(0)) {
        // Transfer NFT to winner
        IERC721(auction.nftContract).transferFrom(
            address(this),
            auction.highestBidder,
            auction.tokenId
        );

        // Pay seller using call (recommended)
        (bool success, ) = payable(auction.seller).call{value: auction.highestBid}("");
        require(success, "ETH transfer to seller failed");

        emit AuctionFinalized(auctionId, auction.highestBidder, auction.highestBid);
    } else {
        // No bids → return NFT to seller
        IERC721(auction.nftContract).transferFrom(
            address(this),
            auction.seller,
            auction.tokenId
        );

        emit AuctionFinalized(auctionId, address(0), 0);
    }
}

}
