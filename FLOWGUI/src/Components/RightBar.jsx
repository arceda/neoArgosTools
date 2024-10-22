import * as React from "react";
import { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Divider from "@mui/material/Divider";
import {
    Typography,
    IconButton,
    Box,
    Link,
    TextField,
    Select,
    MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { TOOLS } from "./ToolsForms/main";
import axios from "axios";

const drawerWidth = 300;
const minDrawer = 120;

export default function RightBar({
    open,
    toolName,
    onClose,
    formData,
    onFormDataChange,
}) {
    const ToolEntry = TOOLS[toolName] || { Component: null, props: {} };
    const { Component: ToolComponent, props } = ToolEntry;
    const [linesPreview, setLinesPreview] = useState(20);
    const [outputPreview, setOutputPreview] = useState("Vacío");

    const handleChangeLinesPreview = async (event) => {
        setLinesPreview(event.target.value);
    };

    useEffect(() => {
        try {
            async function getPreviewOutput() {
                const response = await axios.post(
                    "http://localhost:3000/preview_output",
                    {
                        lines: linesPreview,
                        path: formData.output,
                    }
                );
                setOutputPreview(response.data.output_preview);
            }
            if (formData?.output) {
                getPreviewOutput();
            }
        } catch (error) {
            toast.error("Error al obtener el preview");
        }
    }, [linesPreview, formData]);

    return (
        <Drawer
            sx={{
                width: {
                    xs: open ? minDrawer : "0px",
                    sm: open ? drawerWidth : "0px",
                },
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: { xs: minDrawer, sm: drawerWidth },
                    boxSizing: "border-box",
                    backgroundColor: "transparent",
                },
            }}
            anchor="right"
            variant="persistent"
            open={open}
            className="drawerBackground"
            PaperProps={{ elevation: 16 }}
        >
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={onClose}
                    aria-label="close"
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, textAlign: "center" }}
                    fontWeight="bold"
                >
                    Tool {toolName}
                </Typography>
            </Toolbar>
            <Divider />
            {ToolComponent &&
                React.createElement(ToolComponent, {
                    ...props,
                    formData,
                    onFormDataChange,
                })}
            <Divider />

            <Box>
                <Box mt={2} width="100%" textAlign="center">
                    <Typography variant="body1">
                        El archivo actual es:
                    </Typography>
                    {formData?.output ? (
                        <Link
                            href={"http://localhost:3000/" + formData.output}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="body1"
                        >
                            {"http://localhost:3000/" + formData.output}
                        </Link>
                    ) : (
                        <Typography variant="body1">Ninguno</Typography>
                    )}
                    <Typography variant="body1">Vista previa:</Typography>
                    <Select
                        label="Vista previa de la salida"
                        value={linesPreview}
                        onChange={handleChangeLinesPreview}
                    >
                        <MenuItem value={20}>20 lineas</MenuItem>
                        <MenuItem value={30}>30 lineas</MenuItem>
                        <MenuItem value={40}>40 lineas</MenuItem>
                        <MenuItem value={50}>50 lineas</MenuItem>
                    </Select>
                    {outputPreview ? (
                        <TextField
                            id="outlined-multiline-static"
                            value={outputPreview}
                            multiline
                            rows={5}
                            disabled
                        ></TextField>
                    ) : (
                        <TextField
                            value={"Preview aún no disponible"}
                            rows={5}
                            multiline
                            disabled
                        ></TextField>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}
