const developmentChains = ["hardhat", "localhost"];

const networkConfig = {
  31337: {
    name: "hardhat",
    keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    callbackGasLimit: 90000,
    blockConfirmation: 1,
    interval: 10, //1 min
  },
  11155111: {
    name: "sepolia",
    keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    vrfCoodrinator: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B",
    subscriptionId: "24213741280473853611952645751814669774888017353766876722692976474077269646540",
    callbackGasLimit: 2500000,
    blockConfirmation: 3,
    interval: 90, //15 mins
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
