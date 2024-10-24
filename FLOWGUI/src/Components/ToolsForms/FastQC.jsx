import React, { useState } from "react";
import { Box, Button, Typography, Link } from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const FastQc = ({ formData, onFormDataChange }) => {
    const [htmlPath, setHtmlPath] = useState("");
    const handleEvaluate = async () => {
        try {
            const response = await axios.post(
                "http://localhost:3000/fastqc",
                { file_name: formData.rna },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const { html_path } = response.data;

            setHtmlPath(html_path);
            toast.success("Evaluación completada con éxito.");
        } catch (error) {
            console.error("Error al evaluar el archivo:", error);
            toast.error(
                `Error al evaluar el archivo: ${
                    error.response ? error.response.data.error : error.message
                }`
            );
        }
    };

    return (
        <Box
            component="form"
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxWidth: 300,
                margin: "0 auto",
                mt: 2,
            }}
        >
            <Typography>El RNA a evaluar es: {formData.rna}</Typography>

            <Button
                onClick={handleEvaluate}
                variant="contained"
                color="primary"
            >
                Evaluar con FastQc
            </Button>

            {htmlPath && (
                <Typography>
                    Resultado disponible en:
                    <Link
                        href={`http://localhost:3000/static/${htmlPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body1"
                    >
                        {htmlPath}
                    </Link>
                </Typography>
            )}

            <ToastContainer />
        </Box>
    );
};
