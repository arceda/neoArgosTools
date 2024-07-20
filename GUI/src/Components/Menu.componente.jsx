import { v4 as uuidv4 } from "uuid";
import { Box, Typography, List, Divider, Button } from "@mui/material";
import { ButtonComponent } from "./Button.component";
import { useCanvas } from "../Context/Canvas.context.jsx";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
const categories = [
  {
    title: "Alignment",
    items: [
      { text: "RNA", image: "images/rna.png" },
      { text: "Star", image: "images/file.png" },
      { text: "BWA", image: "images/file.png" },
      { text: "Bowtie", image: "images/file.png" },
      { text: "FastQC", image: "images/file.png" },
      { text: "Samtools", image: "images/file.png" },
    ],
  },
  {
    title: "VCF",
    items: [
      { text: "BCFtools", image: "images/file.png" },
      { text: "GATK", image: "images/file.png" },
      { text: "FusionQ", image: "images/file.png" },
      { text: "Arriba", image: "images/file.png" },
    ],
  },
  {
    title: "Variant Annotation",
    items: [
      { text: "Isovar", image: "images/file.png" },
      { text: "Annovar", image: "images/file.png" },
    ],
  },
  {
    title: "PMHCTRC",
    items: [
      { text: "NetMHCpan", image: "images/file.png" },
      { text: "Bert", image: "images/file.png" },
      { text: "MHCflurry", image: "images/file.png" },
    ],
  },
  {
    title: "Mass Spectrometry",
    items: [{ text: "Maxquant", image: "images/file.png" }],
  },
];

export const Menu = () => {
  const { createNode, exportToJson, importFromJson } = useCanvas();

  const handleButtonClick = (text, image) => {
    createNode(text, "lightgray", image);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const json = e.target.result;
        importFromJson(json);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ overflowY: "auto", maxHeight: "100vh", width: "18vw" }}>
      <Box
        sx={{
          background: "#e8f5e9",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 1,
          marginTop: "10px",
          border: "2px solid #4caf50",
        }}
      >
        <Button variant="contained" color="primary" onClick={exportToJson}>
          <FileDownloadIcon />
          Exportar a JSON
        </Button>
        <input
          accept=".json"
          id="import-json"
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <label htmlFor="import-json">
          <Button variant="contained" color="inherit" component="span">
            <FileUploadIcon />
            Importar JSON
          </Button>
        </label>
      </Box>
      {categories.map((category, categoryIndex) => (
        <div
          key={categoryIndex}
          style={{
            marginBottom: "10px",
            border: "2px solid #4caf50",
          }}
        >
          <Box
            sx={{
              background: "#e8f5e9",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 1,
            }}
          >
            <Typography variant="subtitle1">{category.title}</Typography>
          </Box>

          <List
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 100px))",
              gap: 1,
            }}
          >
            {category.items.map((button, buttonIndex) => (
              <ButtonComponent
                key={buttonIndex}
                text={button.text}
                image={button.image}
                onClick={() => handleButtonClick(button.text, button.image)}
              />
            ))}
          </List>
          {categoryIndex < categories.length - 1 && <Divider />}
        </div>
      ))}
    </div>
  );
};
