require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();

const HARDFORK = 'london';
const alchemyApiKey = process.env.alchemyApiKey;
const apiKey = process.env.apiKeyForEthereum;
const OWNER = process.env.OWNER;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        blockNumber: 15766491,
      },
    },
    ethereum: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      chainId: 1,
      accounts: [OWNER]
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
      chainId: 11155111,
      accounts: [OWNER]
    }
  },
  paths:{
    sources: "./contracts",
    artifacts: "./artifacts"
  },
  etherscan: {
    apiKey: apiKey
  },
  solidity: {
    compilers: [
        {
          version: "0.8.17",
          settings: {
            optimizer: {
              enabled: true,
              runs: 200,
            },
          }
        },
        {
          version: "0.6.6",
          settings: {
            optimizer: {
              enabled: true,
              runs: 200,
            },
          }
        },
        {
          version: "0.5.16",
          settings: {
            optimizer: {
              enabled: true,
              runs: 200,
            },
          }
        }
    ]
  }
};
