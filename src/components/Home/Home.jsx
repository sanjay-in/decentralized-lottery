import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import ConnectMetaMask from "../ConnectMetamask/ConnectMetaMask";
import EnterLottery from "../EnterLottery/EnterLottery";
import confetti from "../../assets/confetti.png";
import "./Home.css";

const Home = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const connectToMetamask = async () => {
    if (window.ethereum) {
      await window.ethereum
        ?.request({
          method: "eth_requestAccounts",
        })
        .then(() => {
          setIsWalletConnected(true);
        })
        .catch((error) => console.log(error));
    } else {
      toast.error("Metamask not detected", {
        position: "top-center",
        hideProgressBar: "true",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
      });
      setIsWalletConnected(false);
    }
  };

  useEffect(() => {
    connectToMetamask();
  }, []);

  return (
    <div>
      <h1 className="home-header">
        <span>Decentralized</span>Lottery
      </h1>
      {isWalletConnected ? <EnterLottery /> : <ConnectMetaMask connectToMetamask={connectToMetamask} />}
      <img className="confetti-background-1" src={confetti} />
      <img className="confetti-background-2" src={confetti} />
      <ToastContainer />
    </div>
  );
};

export default Home;
