const { ethers, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config.cjs");
const { verify } = require("../utils/verify/verify.cjs");

module.exports = async ({ getNamedAccounts, deployments }) => {
  let vrfCoodrinator, subscriptionId, vrfCoodrinatorAddress;
  const chainId = network.config.chainId;
  const keyHash = networkConfig[chainId]["keyHash"];
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
  const interval = 10;
  const minimumEntranceFee = ethers.parseEther("0.001");

  const { deployer } = await getNamedAccounts();
  const { deploy, log } = await deployments;

  if (developmentChains.includes(network.name)) {
    const contract = await deployments.get("VRFCoordinatorV2_5Mock");
    vrfCoodrinator = await ethers.getContractAt(contract.abi, contract.address);
    vrfCoodrinatorAddress = contract.address;

    const transactionResponse = await vrfCoodrinator.createSubscription();
    const transactionReceipt = await transactionResponse.wait();
    subscriptionId = transactionReceipt.logs[0].args.subId.toString();

    const FUND_AMOUNT = ethers.parseEther("1");
    await vrfCoodrinator.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    vrfCoodrinatorAddress = networkConfig[chainId]["vrfCoodrinator"];
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }

  const args = [subscriptionId, vrfCoodrinatorAddress, keyHash, callbackGasLimit, interval, minimumEntranceFee];

  log("Deploying Lottery contract...");
  const lottery = await deploy("Lottery", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[chainId]["blockConfirmation"] || 1,
  });

  log("Deployed contract");
  log("------------------------------------");

  if (developmentChains.includes(network.name)) {
    await vrfCoodrinator.addConsumer(subscriptionId, lottery.address);
  }

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying....");
    await verify(lottery.address, args);
  }
};

module.exports.tags = ["all", "lottery"];
