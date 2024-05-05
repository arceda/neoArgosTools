import { Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useCanvasContext } from "../Context/Canvas.context";
import * as go from "gojs";
import { SidepanelComponent } from "./Sidepanel.component";

const baseURL = "http://127.0.0.1:5000";
let filesArray = [];

const uploadFile = (event) => {
  const fileFormat = {};

  const file = event.target.files[0];
  if (file) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      fileFormat.name = file.name;
      const content = e.target.result;
      fileFormat.data = content;

      localStorage.setItem("file", JSON.stringify(fileFormat)); //Se emplea almacenamiento local

      filesArray.push(file); //Para el nombre en la interfaz
    };

    fileReader.onerror = (e) => {
      console.error("Error leyendo el archivo:", e);
    };

    fileReader.readAsDataURL(file);
  }
};

const getFiles = () => {
  let uploadedFiles = JSON.parse(localStorage.getItem("file"));
  return uploadedFiles;
};

const fastQC = async () => {
  const files = getFiles();

  let response = await fetch(baseURL + "/fastqc", {
    method: "post",
    body: JSON.stringify(files),
    headers: {
      "Content-Type": "application/json",
    },
  });

  let res = await response.json();
  if (res.status !== 1) {
    //Popup de subida incorrecta o no valida de archivos
  }
};

const formTemplate = () => {
  let inputs = [
    {
      tool: "RNA",
      components: (
        <div
          key={0}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <label htmlFor={"rna"}>Upload File for Analysis</label>
          <input
            type={"file"}
            style={{}}
            id={0}
            name={"rna"}
            value={(filesArray[0] = !undefined ? filesArray[0] : "")}
            onChange={(e) => uploadFile(e)}
            accept=".fastq,.fq,.fastq.gz,.fq.gz,.bam,.sam,.cram,.sra,.srx,.fast,.fasta,.fa,.gff,.gtf,.vcf,.vcf.gz,.tsv,.txt,.bed,.wig,.bw,.bb"
          />
          <Button
            variant="outlined"
            onClick={() => console.log("Archivo subido al local storage")}
          >
            Upload File
          </Button>
        </div>
      ),
    },
    {
      tool: "FastQC",
      components: (
        <div key={1}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <p>Name of the Selected File:</p>
            {getFiles() != null ? getFiles()?.name : "Not file selected yet"}
          </div>
          <Button variant="outlined" onClick={() => fastQC()}>
            Analyze Data with FastQC
          </Button>
        </div>
      ),
    },
  ];

  return inputs;
};

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
          click: function (e, obj) {
            //Abrir el modal
            let node = obj.part.data;
            setSidebarOpen(true);
            setSidebarNodeData(node);
          },
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
      diagramRef.current = createDiagram(
        nodes,
        setSidebarOpen,
        setSidebarNodeData
      );
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
      <div
        id="myDiagramDiv"
        style={{ width: "100%", height: "100vh", zIndex: "0" }}
      />
      <SidepanelComponent
        formTemplate={formTemplate()}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        panelData={sidebarNodeData}
      />
    </>
  );
};
