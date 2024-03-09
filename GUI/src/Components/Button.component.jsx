import React from "react";
import { Button, ListItem, ListItemIcon, ListItemText } from "@mui/material";

export const ButtonComponent = ({ id, text, image, onClick }) => (
  <ListItem>
    <Button
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "black",
        "& img": {
          width: "48px",
          height: "48px",
          margin: "0 auto",
        },
      }}
    >
      <ListItemIcon>
        <img src={image} alt={text} />
      </ListItemIcon>
      <ListItemText primary={text} />
    </Button>
  </ListItem>
);
