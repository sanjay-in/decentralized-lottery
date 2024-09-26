const developmentChains = ["hardhat", "localhost"];

const networkConfig = {
  31337: {
    name: "hardhat",
    keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    callbackGasLimit: 90000,
    blockConfirmation: 1,
  },
  11155111: {
    name: "sepolia",
    keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    vrfCoodrinator: "",
    subscriptionId: 0,
    callbackGasLimit: 40000,
    blockConfirmation: 6,
  },
};

module.exports = {
  developmentChains,
  networkConfig,
};
