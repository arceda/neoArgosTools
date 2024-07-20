import React from "react";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import { Tools } from "./NeoArgosTools/NeoArgosTools";

export const SidepanelComponent = ({ isOpen, onClose, tool }) => {
  return (
    <SlidingPane
      className="sliding-pane"
      overlayClassName="sliding-pane-overlay"
      isOpen={isOpen}
      width="500px"
      onRequestClose={onClose}
    >
      <div>{Tools[tool?.text]}</div>
    </SlidingPane>
  );
};
