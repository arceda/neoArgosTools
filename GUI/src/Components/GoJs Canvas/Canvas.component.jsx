import React, { useEffect, useState } from "react";
import { useCanvas } from "../../Context/Canvas.context";
import { SidepanelComponent } from "../Sidepanel.component";

export const CanvasComponent = () => {
  const { diagramRef } = useCanvas();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarNodeData, setSidebarNodeData] = useState(null);
  const $ = go.GraphObject.make;

  useEffect(() => {
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
          {
            click: function (e, obj) {
              //Abrir el modal
              setSidebarOpen(true);
              let node = obj.part.data;
              setSidebarNodeData(node);
            },
          },
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
    <div>
      <div>
        <div
          id="myDiagramDiv"
          style={{ height: "100vh", width: "80vw", color: "red" }}
        />
      </div>

      <SidepanelComponent
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        tool={sidebarNodeData}
      />
    </div>
  );
};
