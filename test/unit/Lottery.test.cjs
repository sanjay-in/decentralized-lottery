const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config.cjs");

!developmentChains.includes(network.name)
  ? describe.skip()
  : describe("Lottery", () => {
      let lottery, lotteryContract, deployer, accounts, vrfCoordinatorV2Mock, entranceFee, interval;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        accounts = await ethers.getSigners();
        await deployments.fixture(["all"]);

        lotteryContract = await deployments.get("Lottery");
        lottery = await ethers.getContractAt(lotteryContract.abi, lotteryContract.address);

        const v2MockContract = await deployments.get("VRFCoordinatorV2_5Mock");
        vrfCoordinatorV2Mock = await ethers.getContractAt(v2MockContract.abi, v2MockContract.address);

        entranceFee = await lottery.i_minimumEntryFees();
        interval = await lottery.getInterval();
      });

      describe("constructor", () => {
        it("checks if entranceFee is correct", async () => {
          assert.equal(entranceFee, ethers.parseEther("0.001"));
        });

        it("checks if interval is correct", async () => {
          assert.equal(interval, 10);
        });

        it("checks if lottery state is open", async () => {
          const lotteryState = await lottery.getLotteryState();
          assert.equal(lotteryState, 0);
        });

        it("checks if callback gas limit match", async () => {
          const callbackGasLimit = await lottery.getCallbackGasLimit();
          assert.equal(callbackGasLimit, networkConfig[network.config.chainId]["callbackGasLimit"]);
        });
      });

      describe("enter lottery", () => {
        it("reverts when you dont pay enough", async () => {
          await expect(lottery.enterLottery()).to.be.revertedWithCustomError(lottery, "Lottery___FeeNotEnough");
        });

        it("checks if player has been added", async () => {
          await lottery.enterLottery({ value: ethers.parseEther("0.0011") });
          const allPlayers = await lottery.getParticipantsList();
          assert.equal(allPlayers[0], deployer);
        });

        it("emits LotteryEntered event", async () => {
          await expect(lottery.enterLottery({ value: entranceFee }))
            .to.emit(lottery, "LotteryEntered")
            .withArgs(deployer);
        });

        it("reverts when player tries to enter after lottery is closed", async () => {
          await lottery.enterLottery({ value: entranceFee });
          await ethers.provider.send("evm_increaseTime", [interval.toString()]);
          await ethers.provider.send("evm_mine");
          await lottery.checkUpkeep("0x");
          await lottery.performUpkeep("0x");
          await expect(lottery.enterLottery({ value: entranceFee })).to.be.revertedWithCustomError(lottery, "Lottery___Closed");
        });
      });

      describe("checkUpkeep", () => {
        it("returns false if state is not open", async () => {
          await lottery.enterLottery({ value: entranceFee });
          await ethers.provider.send("evm_increaseTime", [interval.toString()]);
          await ethers.provider.send("evm_mine");
          await lottery.checkUpkeep("0x");
          await lottery.performUpkeep("0x");
          const state = await lottery.getLotteryState();
          const [upkeepNeeded] = await lottery.checkUpkeep("0x");
          assert(state == 1, upkeepNeeded == false);
        });

        it("returns false if no particiapnts", async () => {
          const [upkeepNeed] = await lottery.checkUpkeep("0x");
          const partcipantsList = await lottery.getParticipantsList();
          assert(partcipantsList.length == 0, !upkeepNeed);
        });

        it("returns false if no balance", async () => {
          await ethers.provider.send("evm_increaseTime", [interval.toString()]);
          await ethers.provider.send("evm_mine");
          const contractBalance = await ethers.provider.getBalance(lotteryContract.address);
          const [upkeepNeed] = await lottery.checkUpkeep("0x");
          assert(contractBalance == 0, !upkeepNeed);
        });

        it("returns false if time hasn't passed", async () => {
          await lottery.enterLottery({ value: entranceFee });
          const lastTimestamp = await lottery.getLastTimestamp();
          const currentTimestamp = await lottery.getCurrentTimestamp();
          const [upkeepNeeded] = await lottery.checkUpkeep("0x");
          assert(currentTimestamp - lastTimestamp < interval, !upkeepNeeded);
        });
      });

      describe("performUpkeep", () => {
        it("check performUpkeep", async () => {
          await lottery.enterLottery({ value: entranceFee });
          await ethers.provider.send("evm_increaseTime", [interval.toString()]);
          await ethers.provider.send("evm_mine");
          await lottery.checkUpkeep("0x");
          const txResponse = await lottery.performUpkeep("0x");
          const txReciept = await txResponse.wait(1);
          const requestId = txReciept.logs[1].args.requestId;
          assert(requestId > 0);
        });
      });

      describe("fulfillRandomWords", () => {
        it("check if invalid request is sent", async () => {
          await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, lotteryContract.address)).to.be.revertedWithCustomError(
            vrfCoordinatorV2Mock,
            "InvalidRequest"
          );
        });

        it("checks if balance after win matches", async () => {
          const accountBalances = {};
          let totalFundedAmount = 0;
          for (let index = 1; index < 3; index++) {
            await lottery.connect(accounts[index]).enterLottery({ value: ethers.parseEther("1") });
            totalFundedAmount++;
            const balanceAfterFunding = await ethers.provider.getBalance(accounts[index]);
            accountBalances[accounts[index].address] = balanceAfterFunding;
          }
          await ethers.provider.send("evm_increaseTime", [interval.toString()]);
          await ethers.provider.send("evm_mine");

          await new Promise(async (resolve, reject) => {
            lottery.once("WinnerSelected", async () => {
              try {
                const recentWinner = await lottery.getWinnersList();
                const balanceBeforeWin = accountBalances[recentWinner];
                const winnerCalculatedBalance = balanceBeforeWin + ethers.parseEther(totalFundedAmount.toString());
                const balanceAfterWin = await ethers.provider.getBalance(recentWinner);
                assert.equal(ethers.formatEther(balanceAfterWin.toString()), ethers.formatEther(winnerCalculatedBalance.toString()));
                resolve();
              } catch (error) {
                reject(error);
              }
            });

            try {
              const tx = await lottery.performUpkeep("0x");
              const txReciept = await tx.wait(1);

              const requestId = txReciept.logs[1].args.requestId;
              await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, lotteryContract.address);
            } catch (error) {
              reject(error);
              console.log("error", error);
            }
          });
        }).timeout(10000);

        // it("reverts with error if not able to send eth", async () => {
        //   await lottery.connect(accounts[1]).enterLottery({ value: ethers.parseEther("0.1") });
        //   // await lottery.connect(accounts[2]).enterLottery({ value: ethers.parseEther("1") });

        //   // Increase time if required for lottery rules
        //   await ethers.provider.send("evm_increaseTime", [interval.toString()]);
        //   await ethers.provider.send("evm_mine");

        //   // Perform upkeep to select a winner
        //   const tx = await lottery.performUpkeep("0x");
        //   // await lottery.setParticipants();
        //   const txReceipt = await tx.wait(1);
        //   const requestId = txReceipt.logs[1].args.requestId;

        //   // Manipulate the participants array to contain the zero address
        //   await lottery.setParticipants();
        //   const particiapnts = await lottery.getParticipantsList();
        //   console.log("particiapnts", particiapnts);

        //   // Mock fulfillRandomWords with randomWords that selects the zero address
        //   await expect(vrfCoordinatorV2Mock.fulfillRandomWords(requestId, lotteryContract.address)) // Using index 0 which points to the zero address
        //     .to.be.revertedWithCustomError(lottery, "Lottery___TransactionFailed");
        // });
      });
    });
