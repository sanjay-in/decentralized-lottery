import { useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import { Button } from "react-bootstrap";
import contractAddress from "../../constants/contractAddress.json";
import ABI from "../../constants/ABI.json";
import "./EnterLottery.css";

const EnterLottery = () => {
  let lotteryContract;
  const [ethAmount, setEthAmount] = useState();
  const [recentWinner, setRecentWinner] = useState("");
  const [copyClipboard, setCopyClipboard] = useState(false);

  const setLotteryContract = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        lotteryContract = new Contract(contractAddress, ABI, signer);
      } catch (error) {
        console.log(error);
      }
    } else {
    }
  };

  const updateRecentWinner = async () => {
    try {
      const recentWinner = await lotteryContract.getWinnersList();
      setRecentWinner(recentWinner);
    } catch {
      console.log("Failed to update recent winner");
    }
  };

  const enterLottery = async () => {
    try {
      await lotteryContract.enterLottery({ value: ethers.parseEther(ethAmount.toString()) });
      console.log("Entered lottery");
    } catch {
      console.log("Failed to enter lottery");
    }
  };

  const trimmedAddress = (str) => {
    const stringLength = str.length;
    const trimmedString = `${str.substring(0, 7)}...${str.substring(stringLength - 5, stringLength)}`;
    return trimmedString;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recentWinner);
    setCopyClipboard(true);
  };

  useEffect(() => {
    lotteryContract?.once("WinnerSelected", () => {
      updateRecentWinner();
    });

    setLotteryContract();
  }, []);
  return (
    <div className="lottery">
      <p className="lottery-text">Enter the amount you need to give for lottery</p>
      <div className="lottery-amount">
        <div className="lottery-amount-symbol" aria-hidden="true">
          ETH
        </div>
        <input
          className="lottery-amount-value"
          type="number"
          placeholder="0.001"
          step={0.001}
          min={0.001}
          value={ethAmount}
          onChange={(e) => setEthAmount(e.target.value)}
        />
      </div>
      <div className="lottery-amount-info">
        <i className="fa fa-info-circle" aria-hidden="true"></i>
        <div className="lottery-amount-info-text">Minimum amount to enter raffle is 0.001 ETH</div>
      </div>
      <div>
        <div className="lottery-recent-winner">
          {recentWinner ? (
            <div className="lottery-recent-winner-container">
              Recent Winner: {trimmedAddress(recentWinner)}{" "}
              <div className="lottery-tooltip">
                <i className="fa fa-clone lottery-clone-icon" aria-hidden="true" onClick={copyToClipboard}></i>
                <span className="lottery-tooltip-text">{copyClipboard ? "Copied!" : "Copy address"}</span>
              </div>
            </div>
          ) : (
            "No recent winner"
          )}
        </div>
      </div>
      <Button id="lottery-btn" onClick={enterLottery}>
        <span className="lottery-btn-txt">Enter</span>
      </Button>
    </div>
  );
};

export default EnterLottery;
