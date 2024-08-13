// SimpleForm.jsx
import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TextField, Box, Button, Divider } from '@mui/material';


const SimpleFormSTAR = ({ formData, onFormDataChange, setLoading}) => {    
    const handleSubmit = async () => {
        setLoading(true)
        try {
            console.log(formData)
            const response = await axios.post('http://localhost:5000/star', {
                threads: formData.threads,
                star_options: formData.star_options,
            });

            if (response.data.status === 1) {
                setLoading(false);
                toast.success(response.data.message);
            } else {
                setLoading(false);
                toast.error('Error: ' + response.data.message);
            }
        } catch (err) {
            toast.error('Hubo un error');
            console.error(err);
        }
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
            component="form" 
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, margin: '0 auto', mt:2 }}
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

export default SimpleFormSTAR;
