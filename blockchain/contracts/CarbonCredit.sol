// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CarbonCredit
 * @dev ERC-721 token representing an approved carbon credit.
 * Verification happens OFF-CHAIN. This contract only handles ownership.
 */
contract CarbonCredit is ERC721, Ownable {
    uint256 private _tokenIds;

    mapping(uint256 => string) private _tokenURIs;

    constructor(address initialOwner)
        ERC721("Carbon Credit", "CCREDIT")
        Ownable(initialOwner)
    {}

    function mintCarbonCredit(
        address to,
        string memory metadataURI
    ) external onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(to, newTokenId);
        _tokenURIs[newTokenId] = metadataURI;

        return newTokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }
}
