import React, { useEffect, useState } from "react";
import * as go from "gojs";
import { SidepanelComponent } from "./Sidepanel.component";
import { Button } from "@mui/material";

export const diagramRef = React.createRef();

const baseURL = "http://127.0.0.1:3000";
let filesArray = [];

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

const uploadFile = (event) => {
  const file = event.target.files[0];
  if (file) {
    filesArray.push(file); //Para el nombre en la interfaz
  }
};

const fastQC = async () => {
  const formData = new FormData();

  filesArray.forEach((file, index) => {
    formData.append("fastqc_file", file);
  });

  let response = await fetch(baseURL + "/fastqc", {
    method: "post",
    body: formData,
  });

  if (response.ok) {
    let htmlResponse = await response.text();
    let fastqcResponseElement = document.getElementById("fastqcResponse");
    if (fastqcResponseElement) {
      fastqcResponseElement.innerHTML = htmlResponse;
    } else {
      console.error("Element with id 'fastqcResponse' not found");
    }
  } else {
    console.error("Failed to fetch fastqc data");
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
            id={0}
            name={"rna"}
            onChange={uploadFile}
            accept=".fastq,.fq,.fastq.gz,.fq.gz,.bam,.sam,.cram,.sra,.srx,.fast,.fasta,.fa,.gff,.gtf,.vcf,.vcf.gz,.tsv,.txt,.bed,.wig,.bw,.bb"
          />
          <Button
            variant="outlined"
            onClick={() => console.log("Archivo subido al local storage")}
          >
            Upload File
          </Button>
          <div id="fastqcResponse"></div>
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
            {filesArray.length > 0
              ? filesArray[0].name
              : "No file selected yet"}
          </div>
          <Button variant="outlined" onClick={fastQC}>
            Analyze Data with FastQC
          </Button>
        </div>
      ),
    },
  ];

  return inputs;
};

export const CanvasComponent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarNodeData, setSidebarNodeData] = useState(null);

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
