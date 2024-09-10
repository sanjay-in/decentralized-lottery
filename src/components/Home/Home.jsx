import React from "react";
import "./Home.css";
import ConnectMetaMask from "../ConnectMetamask/ConnectMetaMask";

const Home = () => {
  return (
    <div>
      <h1 className="home-header">Decentralized Lottery</h1>
      <ConnectMetaMask />
    </div>
  );
};

export default Home;
