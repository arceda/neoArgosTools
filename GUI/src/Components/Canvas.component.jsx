import React, { useEffect, useRef } from "react";
import * as go from "gojs";

// Creación de la referencia al diagrama de forma accesible globalmente
export const diagramRef = React.createRef();

export function createNode(key, text, color, image) {
  const diagram = diagramRef.current;
  if (diagram) {
    const newNode = {
      key: key,
      text: text,
      color: color,
      image: image,
    };
    diagram.model.addNodeData(newNode);
    diagram.updateAllTargetBindings();
  }
}

export const CanvasComponent = () => {
  useEffect(() => {
    const $ = go.GraphObject.make;

    function makePort(name, spot, output, input) {
      return $(go.Shape, "Circle", {
        stroke: "black",
        strokeWidth: 1,
        desiredSize: new go.Size(7, 7),
        alignment: spot,
        alignmentFocus: spot,
        portId: name,
        fromSpot: spot,
        toSpot: spot,
        fromLinkable: output,
        toLinkable: input,
        cursor: "pointer",
      });
    }

    if (!diagramRef.current) {
      diagramRef.current = $(go.Diagram, "myDiagramDiv", {
        "undoManager.isEnabled": true,
        "draggingTool.dragsLink": true,
        "linkingTool.isUnconnectedLinkValid": true,
        "linkingTool.portGravity": 20,
        "relinkingTool.isUnconnectedLinkValid": true,
        "relinkingTool.portGravity": 20,
      });

      diagramRef.current.nodeTemplate = $(
        go.Node,
        "Spot",
        { locationSpot: go.Spot.Center },
        $(
          go.Panel,
          "Vertical",
          $(
            go.Picture,
            { margin: 10, width: 50, height: 50 },
            new go.Binding("source", "image")
          ),
          $(go.TextBlock, { margin: 8 }, new go.Binding("text"))
        ),
        makePort("T", go.Spot.Top, true, true),
        makePort("L", go.Spot.Left, true, true),
        makePort("R", go.Spot.Right, true, true),
        makePort("B", go.Spot.Bottom, true, true)
      );

      diagramRef.current.linkTemplate = $(
        go.Link,
        { routing: go.Link.Orthogonal, curve: go.Link.JumpOver },
        $(
          go.Shape,
          { strokeWidth: 2, stroke: "gray" },
          new go.Binding("stroke"),
          new go.Binding("strokeWidth")
        ),
        $(
          go.Shape,
          { toArrow: "Standard", stroke: null, fill: "gray" },
          new go.Binding("fill")
        )
      );
    }

    if (diagramRef.current) {
      diagramRef.current.model = new go.GraphLinksModel(
        [{ key: 0, text: "RNA", color: "lightblue", image: "images/rna.png" }],
        []
      );
    }
  }, []);

  return (
    <div id="myDiagramDiv" style={{ width: "100%", height: "100vh" }}></div>
  );
};
