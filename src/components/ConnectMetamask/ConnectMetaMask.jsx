import React from "react";
import { Button } from "react-bootstrap";
import "./ConnectMetaMask.css";

const ConnectMetaMask = ({ connectToMetamask }) => {
  return (
    <div className="connect-metamask">
      <p className="connect-metamask-text">Your MetaMask wallet is not connected</p>
      <Button className="connect-metamask-btn" variant="warning" onClick={connectToMetamask}>
        Connect to MetaMask
      </Button>
    </div>
  );
};

export default ConnectMetaMask;
