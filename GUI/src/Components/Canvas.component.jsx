import React, { useEffect, useRef } from "react";
import { useCanvasContext } from "../Context/Canvas.context";
import * as go from "gojs";

const createDiagram = (initialNodes) => {
  const $ = go.GraphObject.make;

  const myDiagram = $(go.Diagram, "myDiagramDiv", {
    "undoManager.isEnabled": true,
    nodeTemplate: $(
      go.Node,
      "Auto",
      { locationSpot: go.Spot.Center },
      $(
        go.Panel,
        "Vertical",
        $(
          go.Picture,
          { width: 50, height: 50, margin: 6 },
          new go.Binding("source", "image")
        ),
        $(
          go.TextBlock,
          { margin: 8, editable: true },
          new go.Binding("text").makeTwoWay()
        )
      )
    ),
    linkTemplate: $(
      go.Link,
      $(go.Shape, { strokeWidth: 2 }),
      $(go.Shape, { toArrow: "Standard" })
    ),
  });

  const model = $(go.GraphLinksModel);
  model.nodeDataArray = initialNodes;
  model.linkDataArray = [];
  myDiagram.model = model;

  return myDiagram;
};

export const CanvasComponent = () => {
  const diagramRef = useRef(null);
  const { nodes } = useCanvasContext();

  useEffect(() => {
    if (!diagramRef.current) {
      diagramRef.current = createDiagram(nodes);
    }
  }, []);

  useEffect(() => {
    if (diagramRef.current) {
      const model = diagramRef.current.model;
      const addedNode = nodes[nodes.length - 1];

      if (nodes.length > 1) {
        const lastNode = nodes[nodes.length - 2];
        const lastNodeId = lastNode.key;

        model.addNodeData(addedNode);

        const lastNodeKey = lastNodeId;
        const newNodeKey = addedNode.key;

        model.addLinkData({ from: lastNodeKey, to: newNodeKey });
      }
    }
    console.log(nodes);
  }, [nodes]);

  return (
    <div id="myDiagramDiv" style={{ width: "100%", height: "100vh" }}></div>
  );
};
