import React from "react";
import { Button } from "react-bootstrap";
import "./EnterLottery.css";

const EnterLottery = () => {
  return (
    <div className="lottery">
      <p className="lottery-text">Enter the amount you need to give for lottery</p>
      <div className="lottery-amount">
        <i class="fa fa-usd lottery-amount-symbol" aria-hidden="true"></i>
        <input className="lottery-amount-value" type="number" placeholder="50" min={50} />
      </div>
      <div className="lottery-amount-info">
        <i className="fa fa-info-circle" aria-hidden="true"></i>
        <div className="lottery-amount-info-text">Minimum amount to enter raffle is $50</div>
      </div>
      <Button id="lottery-btn">
        <span className="lottery-btn-txt">Enter</span>
      </Button>
    </div>
  );
};

export default EnterLottery;
