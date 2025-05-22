import React, { useState } from "react";
import HelpIcon from "../assets/HelpIcon.png";
import "../styles/HelpTooltip.css";

const HelpTooltip = ({ children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="help-tooltip-wrapper">
      <img
        src={HelpIcon}
        alt="Help"
        className="help-icon"
        onClick={() => setVisible(!visible)}
      />
      {visible && <div className="tooltip-box">{children}</div>}
    </div>
  );
};

export default HelpTooltip;
