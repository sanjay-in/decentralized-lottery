const { assert } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config.cjs");

!developmentChains.includes(network.name)
  ? describe.skip()
  : describe("Lottery staging test", () => {
      let deployer, lottery, vrfCoordinatorV2Mock, entranceFee, intervalTime, accounts;
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        accounts = await ethers.getSigners();

        await deployments.fixture(["all"]);

        const contract = await deployments.get("Lottery");
        lottery = await ethers.getContractAt(contract.abi, contract.address);
        const vrfContract = await deployments.get("VRFCoordinatorV2_5Mock");
        vrfCoordinatorV2Mock = await ethers.getContractAt(vrfContract.abi, vrfContract.address);

        entranceFee = await lottery.i_minimumEntryFees();
        intervalTime = await lottery.getInterval();
      });

      describe("staging test", () => {
        it("works with live network we get a winner", async () => {
          let winnerStartingBalance;
          const playerAccount = accounts[1];
          const playerAccountAddress = playerAccount.address;

          await new Promise(async (resolve, reject) => {
            lottery.once("WinnerSelected", async () => {
              try {
                console.log("Winner selected");
                const recentWinner = await lottery.getWinnersList();
                const lotteryState = await lottery.getLotteryState();
                const players = await lottery.getParticipantsList();
                const contractBalance = await ethers.provider.getBalance(lottery);
                const recentWinnerBalance = await ethers.provider.getBalance(recentWinner);

                assert.equal(playerAccountAddress, recentWinner);
                assert.equal(lotteryState, 0);
                assert.equal(players.length, 0);
                assert.equal(contractBalance, 0);
                assert.equal(winnerStartingBalance + entranceFee, recentWinnerBalance);
                resolve();
              } catch (error) {
                console.log("error", error);
                reject();
              }
            });

            try {
              console.log("Entering Raffle...");
              const lotteryTx = await lottery.connect(playerAccount).enterLottery({ value: entranceFee });
              await lotteryTx.wait(1);
              console.log("Waiting for winner to be selected...");
              await ethers.provider.send("evm_increaseTime", [intervalTime.toString()]);
              await ethers.provider.send("evm_mine");
              const tx = await lottery.performUpkeep("0x");
              const txReciept = await tx.wait(1);
              winnerStartingBalance = await ethers.provider.getBalance(playerAccount);

              const requestId = txReciept.logs[1].args.requestId;
              await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, lottery.target);
            } catch (error) {
              console.log("error", error);
            }
          });
        });
      });
    });
