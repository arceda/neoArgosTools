import React from "react";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css"


export const SidepanelComponent = ({ formTemplate, isOpen, onClose, panelData }) => {
    return (
        <SlidingPane
            className="sliding-pane"
            overlayClassName="sliding-pane-overlay"
            isOpen={isOpen}
            width="400px"
            onRequestClose={onClose}
        >
            <div>
                {formTemplate.filter((item) => item.tool === panelData?.text).map((item) => {
                    const { components } = item;
                    return (
                        <>
                            {components}
                        </>
                    );
                })}

            </div>
        </SlidingPane>
    );
};
