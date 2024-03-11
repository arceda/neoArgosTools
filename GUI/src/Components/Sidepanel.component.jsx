import { Button } from "@mui/material";
import React, { useState } from "react";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css"

export const SidepanelComponent = ({ formTemplate, isOpen, onClose }) => {
    const [data, setData] = useState({});

    return (
        <SlidingPane
            className="sliding-pane"
            overlayClassName="sliding-pane-overlay"
            isOpen={isOpen}
            width="600px"
            onRequestClose={onClose}
        >
            {formTemplate.map((item) => {
                const { name, type, label } = item
                return (
                    <div key={name}>
                        <label htmlFor={name}>{label}</label>
                        {(
                            <input
                                type={type}
                                id={name}
                                name={name}
                                value={data[name]}
                                onChange={console.log()} //Implementar el handleChange
                                accept=".fastq.gz"/>)}
                    </div>
                )
            })}
            <Button variant="outlined">Execute Tool</Button>
        </SlidingPane>
    );
};
