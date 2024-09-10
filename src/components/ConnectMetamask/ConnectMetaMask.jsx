import React from "react";
import { Button } from "react-bootstrap";
import "./ConnectMetaMask.css";

const ConnectMetaMask = () => {
  return (
    <div className="connect-metamask">
      <p className="connect-metamask-text">You're MetaMask wallet is not connected</p>
      <Button className="connect-metamask-btn">Connect to MetaMask</Button>
    </div>
  );
};

export default ConnectMetaMask;
