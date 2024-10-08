require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = [process.env.PRIVATE_KEY] || [];
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    sepolia: {
      chainId: 11155111,
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY,
      blockConfirmation: 6,
      saveDeployments: true,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
    participant: {
      default: 1,
    },
  },
};
