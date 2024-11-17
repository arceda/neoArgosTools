// SimpleForm.jsx
import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TextField, Box, Button, Divider } from '@mui/material';

const GATKF = ({ formData, onFormDataChange, setLoading, loading, id, sources }) => {    

    const handleSubmit = async () => {
        let outputVals = []
        console.log("-----------")
        const source_mutect = sources?.filter(node => node.data.name == "Mutect")
        const source_gatkq = sources?.filter(node => node.data.name == "GATK quality")

        setLoading(true)
        console.log(source_mutect)
        console.log(source_gatkq)

        console.log(id)
        console.log(source_gatkq[0].data.formData.fastadir)
        console.log(source_mutect[0].data.formData.output[0])
        console.log(source_gatkq[0].data.formData.contamination_table[0])

        try {

            const response = await axios.post('http://localhost:5000/mutect_filtercalls', {
                node_id: id,
                fasta_file: source_gatkq[0].data.formData.fastadir,
                v_file: source_mutect[0].data.formData.output[0],
                contamination_table_file: source_gatkq[0].data.formData.contamination_table[0],                 
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

        console.log(outputVals)
        
        setLoading(false);

        onFormDataChange({
            ...formData,
            ["output"]: outputVals
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

export default GATKF;
