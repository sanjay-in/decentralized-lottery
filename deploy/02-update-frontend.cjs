const fs = require("fs");
const { deployments } = require("hardhat");
const { frontendContractFile, frontendABI } = require("../helper-hardhat-config.cjs");

const updateContractAddress = async () => {
  const contract = await deployments.get("Lottery");
  fs.writeFileSync(frontendContractFile, JSON.stringify(contract.address));
};

const updateABI = async () => {
  const contract = await deployments.get("Lottery");
  fs.writeFileSync(frontendABI, JSON.stringify(contract.abi));
};

module.exports = async () => {
  if (process.env.UPDATE_FRONTEND == "true") {
    await updateABI();
    await updateContractAddress();
    console.log("updated frontend");
    console.log("------------------------------------");
  }
};

module.exports.tags = ["all", "updateFrontend"];
