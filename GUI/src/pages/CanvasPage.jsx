import React from "react";
import { Grid, Box, List, Divider, Typography } from "@mui/material";
import { CanvasComponent } from "../Components/Canvas.component.jsx";
import { ButtonComponent } from "../Components/Button.component.jsx";
import { useCanvasContext } from "../Context/Canvas.context.jsx";

const CanvasPage = () => {
  const { addNode, nodes } = useCanvasContext();

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
    const lastNodeKey = nodes.length > 0 ? nodes[nodes.length - 1].key : 1;
    const newNodeKey = lastNodeKey + 1;

    addNode({
      key: newNodeKey,
      text: text,
      color: "lightgray",
      image: image,
    });
  };

  return (
    <Grid container spacing={0} sx={{ height: "100vh", margin: 0, padding: 0 }}>
      <Box
        sx={{
          padding: 0,
          borderRight: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <Typography
              variant="subtitle1"
              sx={{ paddingLeft: 1, paddingTop: 1 }}
            >
              {category.title}
            </Typography>
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
      <Box sx={{ padding: 0, flex: 1 }}>
        <CanvasComponent />
      </Box>
    </Grid>
  );
};

export default CanvasPage;
