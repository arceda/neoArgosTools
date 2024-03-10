import React from "react";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css"

export const SidepanelComponent = ({ isOpen, onClose, nodeData }) => {
    return (
        <SlidingPane
            className="sliding-pane"
            overlayClassName="sliding-pane-overlay"
            isOpen={isOpen}
            width="600px"
            title={"Properties"}
            onRequestClose={onClose}
        >
            <>Contenido Custom</>
        </SlidingPane>
    );
};
