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
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
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
      blockConfirmation: 3,
      saveDeployments: true,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: true, // Set to true to enable the reporter
    currency: "USD", // You can set the currency for gas cost
    gasPrice: 20, // Optional: specify the gas price in gwei
    outputFile: "gas-report.txt", // Output file for gas report
    noColors: true, // Disable colors in the report
    excludeContracts: ["VRFCoordinatorV2_5Mock"],
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
