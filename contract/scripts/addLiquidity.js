const hre = require("hardhat");
const { ethers } = require("hardhat");
const { BigNumber, constants: { MaxUint256, AddressZero }, utils } = require("ethers");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const expandTo18Decimals = (n) => {
    return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}


async function main() {
  const [deployer] = await ethers.getSigners();
  const router = await ethers.getContractAt("UniswapV2Router02", "0x03602129dd6fF2eaEE8Bc2c1CAAfE95Deae7EF6e");
  const WETH = "0x7b79995e5f793a07bc00c21412e50ecae098e7f9";
  const mockToken = await ethers.getContractAt("MockERC20", "0x5D8E87B5FdC8EB34cdFBEe9f22419432a352446e");

  console.log(deployer.address, router.address, mockToken.address)
    const ethAmount = ethers.utils.parseEther("0.05")
    const tokenAmount = ethers.utils.parseEther("5")
    await mockToken.approve(router.address, MaxUint256, {gasLimit: 30000})

    // try {
    // await router.addLiquidityETH(
    //     mockToken.address,
    //     tokenAmount,
    //     0,
    //     0,
    //     deployer.address,
    //     MaxUint256,
    //     {
    //         value: ethAmount,
    //     }
    // )
    // }catch(err) {
    //     console.log(err)
    // }

    console.log("added")
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  
