// SimpleForm.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TextField, Box, Button } from '@mui/material';

const ProcessFormSTAR = ({ formData, onFormDataChange, setLoading, sources, id}) => {    

    const handleSubmit = async () => {
        let outputVals = []
        console.log("-----------")
        const source = sources.filter(node => node.data.name == "FastQC")
        setLoading(true)
        console.log(source)

        for (const node_dir of source[0].data.formData.output){
            let nodet = "";
            if (node_dir.includes("RNAnormal")) {
                nodet = "RNAnormal"
            } else {
                nodet = "RNAtumor"
            }

            try {
                const indexingPath = formData.indexing.startsWith('.') ? formData.indexing : `./static/InputFiles/STAR/other/${formData.indexing}`;
    
                console.log(indexingPath)
                console.log(id)
                console.log(node_dir)
    
                const response = await axios.post('http://localhost:5000/star', {
                    threads: formData.threads,
                    star_options: formData.star_options,
                    indexing: indexingPath,
                    fastaqcoutput: node_dir,
                    nodeid: id,
                    rnatype: nodet
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

        }

        console.log(outputVals)
        
        setLoading(false);

        onFormDataChange({
            ...formData,
            ["output"]: outputVals
        })
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        onFormDataChange({
            ...formData,
            [name]: value
        })          
    };
    
    return (
        <Box 
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300}}
        >
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

export default ProcessFormSTAR;
