// SimpleForm.jsx
import React from 'react';
import { TextField, Box, Button, Divider } from '@mui/material';

const Picard = ({ formData, onFormDataChange}) => {    

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        onFormDataChange({
            ...formData,
            [name]: value
        })
    };

    const submit = () => {
        console.log("submited")
    }
    
    return (
        <Box 
            component="form" 
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, margin: '0 auto', mt:2 }}
        >
            <Button
                variant="contained"
                onClick={submit}
            >
                Procesar
            </Button>
        </Box>
    );
};

export default Picard;
