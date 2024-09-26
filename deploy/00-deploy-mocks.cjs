const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config.cjs");

module.exports = async ({ getNamedAccounts, deployments }) => {
  if (developmentChains.includes(network.name)) {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;

    const BASE_FEE = ethers.parseEther("0.01");
    const GAS_PRICE_LINK = 1e9;
    const WEI_PER_UNIT_LINK = ethers.parseEther("0.1");

    log("Local network detected");
    log("Deploying Mocks....");

    await deploy("VRFCoordinatorV2_5Mock", {
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK, WEI_PER_UNIT_LINK],
      waitConfirmations: 1,
    });

    log("Mocks deployed");
    log("------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
