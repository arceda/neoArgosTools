import React, { useState } from "react";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Rna = ({ type, formData, onFormDataChange }) => {
    const [url, setUrl] = useState("");
    const [file, setFile] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onFormDataChange({
            ...formData,
            [name]: value,
        });
    };

    const onDrop = (acceptedFiles) => {
        setFile(acceptedFiles[0]);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleUrlChange = (event) => {
        setUrl(event.target.value);
    };

    const handleSubmit = async () => {
        if (!file && !url) {
            toast.error("Debes proporcionar un archivo o una URL.");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("rna_type", type);

        if (file) {
            formDataToSend.append("file", file);
        }
        if (url) {
            formDataToSend.append("url", url);
        }

        try {
            const response = await axios.post(
                "http://localhost:3000/upload",
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            const filePath = response.data.file_path;
            setUrl("");
            setFile(null);
            onFormDataChange({
                ...formData,
                name_file: file ? file.name : "",
                output: [`${filePath}`],
            });
            toast.success("Archivo cargado con éxito.");
        } catch (error) {
            console.error(
                "Error al subir el archivo:",
                error.response ? error.response.data : error.message
            );
            toast.error(
                "Error al cargar el archivo: " +
                    (error.response
                        ? error.response.data.message
                        : error.message)
            );
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="flex-start"
            sx={{ minHeight: "auto", p: 2, bgcolor: "transparent" }}
        >
            <Box
                {...getRootProps()}
                border="2px dashed #000"
                p={4}
                textAlign="center"
                style={{ cursor: "pointer" }}
                mb={4}
                sx={{ borderRadius: "8px", bgcolor: "#fff" }}
            >
                <input {...getInputProps()} />
                <Typography variant="body1" color="textSecondary">
                    Arrastra y suelta archivos aquí, o haz clic para seleccionar
                    archivos
                </Typography>
            </Box>

            {file && (
                <Box mb={2}>
                    <Typography variant="body1">
                        Archivo seleccionado: {file.name}
                    </Typography>
                </Box>
            )}

            <Typography variant="body1" color="textSecondary" mb={2}>
                o puedes subir una URL
            </Typography>

            <Box
                component="form"
                display="flex"
                flexDirection="column"
                alignItems="center"
                width="100%"
                maxWidth="600px"
            >
                <TextField
                    label="Ingresa URL"
                    variant="outlined"
                    fullWidth
                    value={url}
                    onChange={handleUrlChange}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{ width: "100%", marginTop: "10px" }}
                >
                    Subir {type}
                </Button>
            </Box>

            <ToastContainer />
        </Box>
    );
};
