// SimpleForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TextField, Box, Button, Divider, Typography } from '@mui/material';
import DropFileZone from '../DropFileZone'

const GATKQ = ({ formData, onFormDataChange, setLoading, loading, id, sources }) => {    

    const extensions = [".gz", ".tbi"]

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
                formData.append('dir_name', `./static/InputFiles/GATKQ`);
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
                    if (file.path.endsWith(".vcf.gz")) {
                        outputVals.push(response.data.file_path);
                    }
                // Optionally, handle additional logic per file upload
                } else {
                    console.error(`Error uploading file ${file.path}:`, response.data);
                    toast.error(`Error uploading file ${file.path}:`, response.data)
                // Optionally, show an error message
                }
            }

            onFormDataChange({
                ...formData,
                ["vdir"]: outputVals
            })

            toast.success("Data loaded")
            setLoading(false);

        } catch (err) {
            toast.error(err.message)
            setLoading(false);
            console.error('Error uploading files:', err.response ? err.response.data : err.message);
        }
    };

    const handleSubmit = async () => {
        let sorted_dupmarked_bam = []
        let contamination_table = []
        let coverage = []
        
        console.log("-----------")
        const source = sources?.filter(node => node.data.name == "Picard")
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
    
                const response = await axios.post('http://localhost:5000/mutect_pileup', {
                    node_id: id,
                    rnatype: nodet,
                    bam_dir: node_dir,
                    v_dir: formData.vdir[0],
                    chr_config: formData.chrconfig               
                });
                
                console.log(response.data.output)

                if (response.data.status === 1) {
                    sorted_dupmarked_bam.push(response.data.output);
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

        try {
            const tumor_dir = sorted_dupmarked_bam.filter(path => path.includes("RNAtumor"));
            const normal_dir = sorted_dupmarked_bam.filter(path => path.includes("RNAnormal"));
    
            const response = await axios.post('http://localhost:5000/mutect_contamination', {
                node_id: id,
                table_normal_file: normal_dir[0],
                table_tumor_file: tumor_dir[0],           
            });
            
            console.log(response.data.output)

            if (response.data.status === 1) {
                contamination_table.push(response.data.output);
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

        try {
            const tumor_dir = source[0].data.formData.output.filter(path => path.includes("RNAtumor"));
            const normal_dir = source[0].data.formData.output.filter(path => path.includes("RNAnormal"));
    
            const response = await axios.post('http://localhost:5000/mutect_coverage', {
                node_id: id,
                fasta_file: source[0].data.formData.fastadir,
                bam_tumor_file: tumor_dir[0],        
                bam_normal_file: normal_dir[0],     
                chr_config: formData.chrconfig   
            });
            
            console.log(response.data.output)

            if (response.data.status === 1) {
                coverage.push(response.data.output);
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
        
        setLoading(false);

        onFormDataChange({
            ...formData,
            ["sorted_dupmarked_bam"]: sorted_dupmarked_bam,
            ["contamination_table"]: contamination_table,
            ["coverage"]: coverage,
            ["fastadir"]: source[0].data.formData.fastadir
        })
    }
    
    return (
        <Box 
            component="form" 
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, m:2 }}
        >
            <Typography>Confidence File and Index</Typography>
            <DropFileZone 
                loading={loading}
                setLoading={setLoading}
                formData={formData}
                onFormDataChange={onFormDataChange}
                id={id}
                handleDropSubmit={handleDropSubmit}
                extensions={extensions}
                type={""}
            />

            <TextField
                label="Rango del Cromosoma"
                name="chrconfig"
                type='text'
                value={formData.chrconfig}
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

export default GATKQ;
