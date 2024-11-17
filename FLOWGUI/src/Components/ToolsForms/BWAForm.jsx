// SimpleForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TextField, Box, Button, Divider, Typography } from '@mui/material';
import DropFileZone from '../DropFileZone'

const BWA = ({ formData, onFormDataChange, setLoading, loading, id, sources}) => {    

    const extensions = [".gz"]

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        onFormDataChange({
            ...formData,
            [name]: value
        })
    };

    const handleDropSubmit = async (filesSubmitted, type) => {
        setLoading(true);
        let outputVals = []
        // Iterate through each file and send it individually
        try {
            for (const file of filesSubmitted) {
                const formData = new FormData();
                formData.append('dir_name', `./static/InputFiles/BWA/${type}`);
                formData.append('id_folder_name', id);
                formData.append('file', file);

                console.log(formData)
        
                const response = await axios.post('http://localhost:5000/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
        
                if (response.status === 200) {
                    console.log(`File ${file.path} uploaded successfully:`, response.data);
                    outputVals.push(response.data.file_path);
                // Optionally, handle additional logic per file upload
                } else {
                    console.error(`Error uploading file ${file.path}:`, response.data);
                    toast.error(`Error uploading file ${file.path}:`, response.data)
                // Optionally, show an error message
                }
            }

            if (type == "RNAnormal"){
                onFormDataChange({
                    ...formData,
                    ["reqsnormal"]: outputVals
                })
            } else {
                onFormDataChange({
                    ...formData,
                    ["reqstumor"]: outputVals
                })
            }

            toast.success("Data loaded")
            setLoading(false);

        } catch (err) {
            toast.error(err.message)
            setLoading(false);
            console.error('Error uploading files:', err.response ? err.response.data : err.message);
        }
    };

    const handleSubmit = async () => {
        let outputVals = []
        console.log("-----------")
        const source = sources?.filter(node => node.data.name == "FastQC")
        setLoading(true)
        console.log(source)

        let fasta_dir = source[0].data.formData.input

        const r1File = formData.reqsnormal.find(dir => dir.includes("R1"));
        const r2File = formData.reqsnormal.find(dir => dir.includes("R2"));
        console.log(r1File)
        console.log(r2File)

        const r1File_tumor = formData.reqstumor.find(dir => dir.includes("R1"));
        const r2File_tumor = formData.reqstumor.find(dir => dir.includes("R2"));
        console.log(r1File_tumor)
        console.log(r2File_tumor)

        let fa_file = source[0]?.data.formData.input
        console.log(fa_file)
        console.log(formData)

        try {

            const response = await axios.post('http://localhost:5000/bwa_alignment', {
                threads: formData.threads,
                node_id: id,
                rnatype: "RNAnormal",
                fasta_dir: fasta_dir[0],
                req1_dir: r1File,
                req2_dir: r2File,
            });
            
            console.log(response.data.output)

            if (response.data.status === 1) {
                outputVals.push(response.data.output);
                toast.success(response.data.message);
            } else {
                setLoading(false);
                toast.error('Error: ' + response.data.message);
            }
        } catch (err) {
            setLoading(false);
            toast.error('Hubo un error');
            console.error(err);
        }

        console.log("---------------------------")
        console.log(outputVals)
        console.log("---------------------------")

        try {

            const response = await axios.post('http://localhost:5000/bwa_alignment', {
                threads: formData.threads,
                node_id: id,
                rnatype: "RNAtumor",
                fasta_dir: fasta_dir[0],
                req1_dir: r1File_tumor,
                req2_dir: r2File_tumor,
            });
            
            console.log(response.data.output)

            if (response.data.status === 1) {
                outputVals.push(response.data.output);
                toast.success(response.data.message);
            } else {
                setLoading(false);
                toast.error('Error: ' + response.data.message);
            }
        } catch (err) {
            setLoading(false);
            toast.error('Hubo un error');
            console.error(err);
        }

        console.log("---------------------------")
        console.log(outputVals)
        console.log("---------------------------")
        
        setLoading(false);

        onFormDataChange({
            ...formData,
            ["output"]: outputVals,
            ["fastadir"]: fasta_dir[0]
        })
    }
    
    return (
        <Box 
            component="form" 
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, m:2 }}
        >
            <Typography>RNA Normal</Typography>
            <DropFileZone 
                loading={loading}
                setLoading={setLoading}
                formData={formData}
                onFormDataChange={onFormDataChange}
                id={id}
                handleDropSubmit={handleDropSubmit}
                extensions={extensions}
                type={"RNAnormal"}
            />

            <Typography>RNA Tumor</Typography>
            <DropFileZone 
                loading={loading}
                setLoading={setLoading}
                formData={formData}
                onFormDataChange={onFormDataChange}
                id={id}
                handleDropSubmit={handleDropSubmit}
                extensions={extensions}
                type={"RNAtumor"}
            />
            
            <TextField
                label="Número de Hilos"
                name="threads"
                type='number'
                value={formData.threads}
                onChange={handleChange}
                required
            />

            <Button
                variant="contained"
                onClick={handleSubmit}
            >
                Procesar
            </Button>
        </Box>
    );
};

export default BWA;
