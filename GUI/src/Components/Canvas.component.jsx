import { Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useCanvasContext } from "../Context/Canvas.context";
import * as go from "gojs";
import { SidepanelComponent } from "./Sidepanel.component";

const baseURL = "http://127.0.0.1:5000"

const uploadFile = async (file) => {
    console.log(file)
    if (file != null) {
        const form = new FormData();
        form.append("fastqc_file", file); //Update para el endpoint

        let response = await fetch(baseURL + "/upload",
            {
                method: 'post',
                body: form,
            }
        );
        let res = await response.json();
        console.log(res)
        if (res.status !== 1) {
            //Popup de subida incorrecta o no valida de archivos
        }
    }
}

const formTemplate = () => {
  let inputs = [
    {
      "tool": "RNA",
      "components":
        (<div key={0} style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          <label htmlFor={"rna"}>Upload File for Analysis</label>
          <input
            type={"file"}
            style={{

            }}
            id={0}
            name={"rna"}
            value={""}
            onChange={(e) => {
              const { files } = e.target;
              const file = files[0];
              if (file) {
                setData(file);
                //Mensaje de seleccion correcta
              } else {
                //Mensaje de seleccion incorrecta
              }
            }}
            accept=".fastq,.fq,.fastq.gz,.fq.gz,.bam,.sam,.cram,.sra,.srx,.fast,.fasta,.fa,.gff,.gtf,.vcf,.vcf.gz,.tsv,.txt,.bed,.wig,.bw,.bb"
          />
        </div>)
    },
    {
      "tool": "FastQC",
      "components": (
        <div key={1}>
          <Button variant="outlined" onClick={() => uploadFile(data)}>Execute Tool</Button>
        </div>
      )
    }
  ]

  return inputs
}

const createDiagram = (initialNodes, setSidebarOpen, setSidebarNodeData) => {
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
        {
          click: function (e, obj) { //Abrir el modal
            let node = obj.part.data
            setSidebarOpen(true);
            setSidebarNodeData(node);
          }
        },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarNodeData, setSidebarNodeData] = useState(null);

  useEffect(() => {
    if (!diagramRef.current) {
      diagramRef.current = createDiagram(nodes, setSidebarOpen, setSidebarNodeData)
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
    <>
      <div id="myDiagramDiv" style={{ width: "100%", height: "100vh", zIndex: "0" }} />
      <SidepanelComponent formTemplate={formTemplate()} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} panelData={sidebarNodeData} />
    </>

  );
};
