import React from "react";

const converted = {
    
}

export const SidepanelComponent = ({ isOpen, onClose, nodeData }) => {
    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`} style={converted}>
            {nodeData.customID}
            <button onClick={onClose}>Close</button>
        </div>
    );
};
