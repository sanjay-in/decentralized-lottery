// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract Lottery is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    // Type declartion
    enum LotteryState {
        OPEN,
        CLOSE
    }

    // State Variables
    uint256 private s_subscriptionId;
    address private immutable i_vrfCoordinator;
    bytes32 private immutable s_keyHash;
    uint256 public immutable i_minimumEntryFees;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATION = 3;
    uint32 private constant NUM_WORDS = 1;

    // Lottery variables
    address payable[] public s_participants;
    address private s_recentWinner;
    LotteryState public s_lotteryState = LotteryState.OPEN;
    uint256 public s_lastTimestamp;
    uint256 public immutable i_interval;

    // Events
    event LotteryEntered(address indexed participant);
    event RequestIdCreated(uint256 indexed requestId);
    event WinnerSelected(address indexed winner, uint256 totalPrice);

    // Errors
    error Lottery___Closed();
    error Lottery___FeeNotEnough();
    error Lottery___TransactionFailed();

    // Modifiers
    modifier lotteryOpen() {
        if (s_lotteryState == LotteryState.CLOSE) {
            revert Lottery___Closed();
        }
        _;
    }

    modifier insufficientFees(uint256 fees) {
        if (fees < i_minimumEntryFees) {
            revert Lottery___FeeNotEnough();
        }
        _;
    }

    // Constructor
    constructor(
        uint256 subscriptionId,
        address vrfCoordinator,
        bytes32 keyHash,
        uint32 callbackGasLimit,
        uint256 interval,
        uint256 minimumEntryFees
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_subscriptionId = subscriptionId;
        i_vrfCoordinator = vrfCoordinator;
        s_keyHash = keyHash;
        s_lastTimestamp = block.timestamp;
        i_interval = interval;
        i_callbackGasLimit = callbackGasLimit;
        i_minimumEntryFees = minimumEntryFees;
    }

    // Functions

    /**
     * Checks for lottery state and minimum fees
     * adds sender's address to array of participants array
     * Emits an event LotteryEntered
     */
    function enterLottery()
        external
        payable
        lotteryOpen
        insufficientFees(msg.value)
    {
        s_participants.push(payable(msg.sender));
        emit LotteryEntered(msg.sender);
    }

    /**
     * @dev This function is called by the Chainlink node and ensures upkeepNeeded is true
     * Lottery state should be open, should have atleast 1 participant,
     * should have balance and the difference between the timestamps should be greater than interval
     * @return upkeepNeeded
     */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool isOpen = s_lotteryState == LotteryState.OPEN;
        bool hasParticipants = s_participants.length > 0;
        bool hasBalance = address(this).balance > 0;
        bool hasTimePassed = (block.timestamp - s_lastTimestamp) > i_interval;
        upkeepNeeded = (isOpen &&
            hasParticipants &&
            hasBalance &&
            hasTimePassed);
        return (upkeepNeeded, "0x0");
    }

    /**
     * @dev performUpkeep function is called once upkeepNeeded is returned true
     * It sets the lottery state to CLOSE and gets the requestId for randomWords
     * Emits RequestIdCreated(uint256 requestId) event
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (upkeepNeeded) {
            s_lotteryState = LotteryState.CLOSE;
            uint256 requestId = s_vrfCoordinator.requestRandomWords(
                VRFV2PlusClient.RandomWordsRequest({
                    keyHash: s_keyHash,
                    subId: s_subscriptionId,
                    requestConfirmations: REQUEST_CONFIRMATION,
                    callbackGasLimit: i_callbackGasLimit,
                    numWords: NUM_WORDS,
                    extraArgs: VRFV2PlusClient._argsToBytes(
                        VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                    )
                })
            );
            emit RequestIdCreated(requestId);
        }
    }

    /**
     * @dev This function is called by the Chainlink Node
     * It gets the random number and choses a random winner
     * Sends money to the winner and emits WinnerSelected event
     */
    function fulfillRandomWords(
        uint256,
        // requestId
        uint256[] calldata randomWords
    ) internal override {
        uint256 randomNumber = randomWords[0] % s_participants.length;
        address payable winner = s_participants[randomNumber];
        uint256 balance = address(this).balance;
        s_recentWinner = winner;
        s_lotteryState = LotteryState.OPEN;
        s_participants = new address payable[](0);
        (bool success, ) = winner.call{value: balance}("");
        if (!success) {
            revert Lottery___TransactionFailed();
        }
        emit WinnerSelected(winner, balance);
    }

    // Getter Functions
    function getLastTimestamp() external view returns (uint256) {
        return s_lastTimestamp;
    }

    function getCurrentTimestamp() external view returns (uint256) {
        return block.timestamp;
    }

    function getLotteryState() external view returns (LotteryState) {
        return s_lotteryState;
    }

    function getWinnersList() external view returns (address) {
        return s_recentWinner;
    }

    function getInterval() external view returns (uint256) {
        return i_interval;
    }

    function getCallbackGasLimit() external view returns (uint256) {
        return i_callbackGasLimit;
    }

    function getParticipantsList()
        external
        view
        returns (address payable[] memory)
    {
        return s_participants;
    }
}
