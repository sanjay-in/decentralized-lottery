const { ethers, getNamedAccounts, deployments } = require("hardhat");

const enterLottery = async () => {
  await deployments.fixture(["all"]);
  const contract = await deployments.get("Lottery");
  const lottery = await ethers.getContractAt(contract.abi, contract.address);

  const lotteryEntryFee = await lottery.i_minimumEntryFees();
  await lottery.enterLottery({ value: lotteryEntryFee });
  console.log(`Entered Lottery with ${ethers.formatEther(lotteryEntryFee)} ETH.`);

  const balance = await ethers.provider.getBalance(contract.address);
  console.log(`Current balance of contract is ${ethers.formatEther(balance)} ETH`);
};

enterLottery()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log("error", error);
    process.exit(1);
  });
