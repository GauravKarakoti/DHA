const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DHAPlotNFT", function () {
  async function deployFixture() {
    const [owner, collector, other] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("DHAPlotNFT");
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    return { contract, owner, collector, other };
  }

  it("deploys with the expected collection identity", async function () {
    const { contract } = await deployFixture();
    expect(await contract.name()).to.equal("DHA Plot");
    expect(await contract.symbol()).to.equal("DHAP");
    expect(await contract.owner()).to.not.equal(ethers.ZeroAddress);
  });

  it("mints a plot, stores its data, and emits PlotMinted", async function () {
    const { contract, collector } = await deployFixture();
    const metadataUri = "data:application/json;base64,eyJuYW1lIjoiREhBIFBsb3QgIzAwMSJ9";

    await expect(
      contract.mintPlot(
        collector.address,
        metadataUri,
        1,
        "A",
        250,
        "DHA Digital Estate",
      ),
    )
      .to.emit(contract, "PlotMinted")
      .withArgs(1, collector.address, 1);

    expect(await contract.totalMinted()).to.equal(1);
    expect(await contract.totalSupply()).to.equal(1);
    expect(await contract.ownerOf(1)).to.equal(collector.address);
    expect(await contract.tokenURI(1)).to.equal(metadataUri);

    const plot = await contract.plots(1);
    expect(plot.plotNumber).to.equal(1);
    expect(plot.blockName).to.equal("A");
    expect(plot.area).to.equal(250);
    expect(plot.location).to.equal("DHA Digital Estate");
    expect(plot.metadataURI).to.equal(metadataUri);
  });

  it("increments token IDs for different plot numbers", async function () {
    const { contract, collector } = await deployFixture();
    const mint = (plotNumber) =>
      contract.mintPlot(
        collector.address,
        `ipfs://dha/${plotNumber}`,
        plotNumber,
        "B",
        500,
        "DHA Digital Estate",
      );

    await mint(7);
    await mint(8);

    expect(await contract.ownerOf(1)).to.equal(collector.address);
    expect(await contract.ownerOf(2)).to.equal(collector.address);
    expect(await contract.totalMinted()).to.equal(2);
  });

  it("rejects duplicate plot numbers", async function () {
    const { contract, collector, other } = await deployFixture();

    await contract.mintPlot(
      collector.address,
      "ipfs://dha/1",
      42,
      "C",
      300,
      "DHA Digital Estate",
    );

    await expect(
      contract.mintPlot(
        other.address,
        "ipfs://dha/2",
        42,
        "D",
        350,
        "DHA Digital Estate",
      ),
    ).to.be.revertedWith("DHA: plot number already exists");
  });

  it("rejects invalid recipients and incomplete plot data", async function () {
    const { contract, collector } = await deployFixture();

    await expect(
      contract.mintPlot(
        ethers.ZeroAddress,
        "ipfs://dha/1",
        1,
        "A",
        250,
        "DHA Digital Estate",
      ),
    ).to.be.revertedWith("DHA: invalid recipient");

    await expect(
      contract.mintPlot(
        collector.address,
        "",
        2,
        "A",
        250,
        "DHA Digital Estate",
      ),
    ).to.be.revertedWith("DHA: metadata URI required");
  });
});