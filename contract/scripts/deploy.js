const hre = require("hardhat");
const { ethers } = require("hardhat");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  const [deployer] = await ethers.getSigners();

  const SimulationBot = await ethers.getContractFactory("SimulationBot");
  simulationBot = await SimulationBot.deploy();
  await simulationBot.deployed();

  await delay(10000);

  await hre.run("verify:verify", {
    address: simulationBot.address,
    constructorArguments: [],
  });
  
  console.log("SimulationBot deployed: ", simulationBot.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
