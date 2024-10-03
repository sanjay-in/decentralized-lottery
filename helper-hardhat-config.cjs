const developmentChains = ["hardhat", "localhost"];

const networkConfig = {
  31337: {
    name: "hardhat",
    keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    callbackGasLimit: 90000,
    blockConfirmation: 1,
    interval: 60, //1 min
  },
  11155111: {
    name: "sepolia",
    keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    vrfCoodrinator: "0x9ddfaca8183c41ad55329bdeed9f6a8d53168b1b",
    subscriptionId: 1061,
    callbackGasLimit: 90000,
    blockConfirmation: 900, //15 mins
  },
};

const frontendContractFile = "./src/constants/contractAddress.json";
const frontendABI = "./src/constants/ABI.json";

module.exports = {
  developmentChains,
  networkConfig,
  frontendContractFile,
  frontendABI,
};
