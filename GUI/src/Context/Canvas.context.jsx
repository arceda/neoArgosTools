import React, { createContext, useContext, useState, useEffect } from "react";
import * as go from "gojs";
import { v4 as uuidv4 } from "uuid";
import { Grid } from "@mui/material";

const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const diagramRef = React.createRef();

  const createNode = (text, color, image) => {
    const diagram = diagramRef.current;
    if (diagram) {
      const newNode = {
        key: uuidv4().toString(),
        text: text,
        color: color,
        image: image,
      };
      diagram.model.addNodeData(newNode);
      diagram.updateAllTargetBindings();
    }
  };

  const exportToJson = () => {
    const diagram = diagramRef.current;
    if (diagram) {
      const json = diagram.model.toJson();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "NeoArgosTools.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const importFromJson = (json) => {
    const diagram = diagramRef.current;
    if (diagram) {
      diagram.model = go.Model.fromJson(json);
    }
  };

  return (
    <CanvasContext.Provider
      value={{
        diagramRef,
        createNode,
        exportToJson,
        importFromJson,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => useContext(CanvasContext);
