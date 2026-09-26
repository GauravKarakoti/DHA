// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DHAPlotNFT
 * @notice ERC-721 digital plot NFTs for the DHA learning project.
 *
 * These tokens represent digital/virtual plots only. They do not represent
 * legal ownership of real-world property.
 */
contract DHAPlotNFT is ERC721, Ownable {
    struct Plot {
        uint256 plotNumber;
        string blockName;
        uint256 area;
        string location;
        string metadataURI;
    }

    uint256 private _nextTokenId = 1;

    mapping(uint256 tokenId => Plot plot) public plots;
    mapping(uint256 plotNumber => bool exists) public plotNumberExists;

    event PlotMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 indexed plotNumber
    );

    constructor() ERC721("DHA Plot", "DHAP") Ownable(msg.sender) {}

    /**
     * @notice Mint a unique digital plot NFT to an address.
     * @dev Permissionless by design for Phase 1. Marketplace logic belongs
     * in a separate contract in a later phase.
     */
    function mintPlot(
        address to,
        string calldata metadataURI,
        uint256 plotNumber,
        string calldata blockName,
        uint256 area,
        string calldata location
    ) external returns (uint256 tokenId) {
        require(to != address(0), "DHA: invalid recipient");
        require(bytes(metadataURI).length > 0, "DHA: metadata URI required");
        require(plotNumber > 0, "DHA: plot number required");
        require(!plotNumberExists[plotNumber], "DHA: plot number already exists");
        require(bytes(blockName).length > 0, "DHA: block required");
        require(area > 0, "DHA: area required");
        require(bytes(location).length > 0, "DHA: location required");

        tokenId = _nextTokenId++;
        plotNumberExists[plotNumber] = true;
        plots[tokenId] = Plot({
            plotNumber: plotNumber,
            blockName: blockName,
            area: area,
            location: location,
            metadataURI: metadataURI
        });

        _safeMint(to, tokenId);
        emit PlotMinted(tokenId, to, plotNumber);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId);
        return plots[tokenId].metadataURI;
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @notice ERC-721 style supply read used by the Phase 1 gallery.
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}