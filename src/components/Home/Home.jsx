import React from "react";
import "./Home.css";
import ConnectMetaMask from "../ConnectMetamask/ConnectMetaMask";
import EnterLottery from "../EnterLottery/EnterLottery";
import confetti from "../../assets/confetti.png";

const Home = () => {
  return (
    <div>
      <h1 className="home-header">
        <span>Decentralized</span>Lottery
      </h1>
      {/* <ConnectMetaMask /> */}
      <EnterLottery />
      <img className="confetti-background" src={confetti} />
    </div>
  );
};

export default Home;
