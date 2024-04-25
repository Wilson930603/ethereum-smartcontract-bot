const hre = require("hardhat");
const { ethers } = require("hardhat");
const { BigNumber, constants: { MaxUint256, AddressZero }, utils } = require("ethers");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const expandTo18Decimals = (n) => {
    return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}


async function main() {
  const [deployer] = await ethers.getSigners();

  const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
  const factory = await UniswapV2Factory.deploy(deployer.address);
  await factory.deployed()

  let WETH;
  if (network.name == "sepolia") {
    WETH = "0x7b79995e5f793a07bc00c21412e50ecae098e7f9";
  }

  const UniswapV2Router = await ethers.getContractFactory("UniswapV2Router02");
  const router = await UniswapV2Router.deploy(factory.address, WETH)
  await router.deployed()

  const name = "MockToken";
  const symbol = "MockToken";
  const MockToken = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockToken.deploy(name, symbol);
  await mockToken.deployed()

  await mockToken.mint(expandTo18Decimals(10000))

  await factory.createPair(WETH, mockToken.address)
  
  console.log("UniswapV2Factory deployed: ", factory.address);
  console.log("UniswapV2Router deployed: ", router.address);
  console.log("MockToken deployed: ", mockToken.address);

  await delay(10000);
  await hre.run("verify:verify", {
    address: factory.address,
    constructorArguments: [deployer.address],
  });

  await hre.run("verify:verify", {
    address: router.address,
    constructorArguments: [factory.address, WETH],
  });

  await hre.run("verify:verify", {
    address: mockToken.address,
    constructorArguments: [name, symbol],
  });
  
    const ethAmount = ethers.utils.parseEther("0.05")
    const tokenAmount = ethers.utils.parseEther("5")
    await mockToken.approve(router.address, MaxUint256)

    await router.addLiquidityETH(
        mockToken.address,
        tokenAmount,
        0,
        0,
        deployer.address,
        MaxUint256,
        {
            value: ethAmount,
        }
    )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
