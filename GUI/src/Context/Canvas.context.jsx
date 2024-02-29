import React, { createContext, useContext, useState } from "react";

const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const [nodes, setNodes] = useState([
    { key: 0, text: "RNA", color: "lightblue", image: "images/rna.png" },
  ]);

  const addNode = (node) => {
    setNodes((prevNodes) => [...prevNodes, node]);
  };

  const removeNode = (nodeId) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
  };

  return (
    <CanvasContext.Provider value={{ nodes, addNode, removeNode }}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvasContext = () => {
  return useContext(CanvasContext);
};
