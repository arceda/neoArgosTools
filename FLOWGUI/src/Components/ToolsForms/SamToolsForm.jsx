// SimpleForm.jsx
import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TextField, Box, Button, Divider } from '@mui/material';

const SamTools = ({ formData, onFormDataChange, setLoading, loading, id, sources}) => {    

    const handleSubmit = async () => {
        let outputVals = []
        console.log("-----------")
        const source = sources?.filter(node => node.data.name == "BWA")
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
    
                const response = await axios.post('http://localhost:5000/samtools', {
                    node_id: id,
                    rnatype: nodet,
                    bam_dir: node_dir                    
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
            ["output"]: outputVals,
            ["fastadir"]: source[0].data.formData.fastadir
        })
    }
    
    return (
        <Box 
            component="form" 
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, margin: '0 auto', mt:2 }}
        >
            <Button
                variant="contained"
                onClick={handleSubmit}
            >
                Procesar
            </Button>
        </Box>
    );
};

export default SamTools;
