import React from "react";
import { Grid, Box } from "@mui/material";
import { CanvasComponent } from "../Components/GoJs Canvas/Canvas.component.jsx";
import { Menu } from "../Components/Menu.componente.jsx";
const CanvasPage = () => {
  return (
    <Grid container spacing={0}>
      <Menu />
      <CanvasComponent />
    </Grid>
  );
};

export default CanvasPage;
