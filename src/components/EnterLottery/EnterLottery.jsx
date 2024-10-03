import { useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import contractAddress from "../../constants/contractAddress.json";
import ABI from "../../constants/ABI.json";
import "./EnterLottery.css";
import "react-toastify/dist/ReactToastify.css";

const EnterLottery = () => {
  let lotteryContract;
  const [ethAmount, setEthAmount] = useState();
  const [recentWinner, setRecentWinner] = useState("");
  const [copyClipboard, setCopyClipboard] = useState(false);
  const [loading, setLoading] = useState(false);

  const setLotteryContract = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        lotteryContract = new Contract(contractAddress, ABI, signer);
      } catch (error) {
        console.log(error);
        toastMessage("error", "Can't connect to smart contract");
      }
    } else {
      toastMessage("error", "Unable to detect metamask");
    }
  };

  const updateRecentWinner = async () => {
    try {
      if (!lotteryContract) {
        await setLotteryContract();
      }
      const recentWinner = await lotteryContract.getWinnersList();
      setRecentWinner(recentWinner);
    } catch (error) {
      console.log(error);
      toastMessage("error", "Failed to update recent winner");
    }
  };

  const enterLottery = async () => {
    validation();
    setLoading(true);
    try {
      if (!lotteryContract) {
        await setLotteryContract();
      }
      const tx = await lotteryContract.enterLottery({ value: ethers.parseEther(ethAmount.toString()) });
      await tx.wait();
      toastMessage("success", "Thanks for being a participant!");
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toastMessage("error", "Unable to enter lottery");
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

  const validation = () => {
    if (ethAmount < 0.001) {
      toastMessage("error", "Please send 0.001 ETH or more to participate");
      return;
    }
  };

  const toastMessage = (type, text) => {
    if (type == "error") {
      toast.error(text, {
        position: "top-center",
        hideProgressBar: "true",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } else {
      {
        toast.success(text, {
          position: "top-center",
          hideProgressBar: "true",
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }
    }
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
      <Button id="lottery-btn" disabled={loading} onClick={enterLottery}>
        <span className="lottery-btn-txt">{loading ? <Spinner className="lottery-loading-spinner" animation="border" /> : "Enter"}</span>
      </Button>
      <ToastContainer />
    </div>
  );
};

export default EnterLottery;
