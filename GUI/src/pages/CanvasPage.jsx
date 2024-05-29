import React from "react";
import { Grid, Box, List, Divider, Typography } from "@mui/material";
import { CanvasComponent } from "../Components/Canvas.component.jsx";
import { ButtonComponent } from "../Components/Button.component.jsx";
import { v4 as uuidv4 } from "uuid";
import { createNode } from "../Components/Canvas.component.jsx";
const CanvasPage = () => {
  const categories = [
    {
      title: "Alignment",
      items: [
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

  const handleButtonClick = (text, image) => {
    createNode(uuidv4().toString(), text, "lightgray", image);
  };

  return (
    <Grid container spacing={0}>
      <Box
        sx={{
          padding: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100vh",
          overflowY: "auto",
          width: "300px",
        }}
      >
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
      </Box>

      <Box sx={{ padding: 0, flex: 1, height: "100vh" }}>
        <CanvasComponent />
      </Box>
    </Grid>
  );
};

export default CanvasPage;
