// SimpleForm.jsx
import React, { Fragment } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FormControl, Box, Button, FormControlLabel, Radio, RadioGroup, FormLabel, TextField } from '@mui/material';

const IndexFormSTAR = ({ formData, onFormDataChange, setLoading, handleChangeTab }) => { 
    
    const [value, setValue] = React.useState(formData.indexing);

    const handleSubmit = async () => {

        if (value == "Otro"){
            setLoading(true)
            try {
                console.log(formData)
                setLoading(false);
    
            } catch (err) {
                setLoading(false);
                toast.error('Hubo un error');
                console.error(err);
            }
        } else {
            handleChangeTab("2")
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        setValue(value);

        onFormDataChange({
            ...formData,
            [name]: value
        })
    };
    
    return (
        <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300 }}
        >
            <FormControl>
                <FormLabel id="demo-radio-buttons-group-label">Genoma</FormLabel>
                <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="female"
                    name="indexing"
                    value={value}
                    onChange={handleChange}
                >
                    <FormControlLabel value="./hg38" control={<Radio />} label="HG38" />
                    <FormControlLabel value="./hg19" control={<Radio />} label="HG19" />
                    <FormControlLabel value="./reference_chr15" control={<Radio />} label="Default" />
                    <FormControlLabel value="Otro" control={<Radio />} label="Otro" />
                </RadioGroup>

                {value=="Otro" && 
                    <TextField
                        label="Enlace"
                        name="enlace"
                        required
                    />
                }
            </FormControl>

            <Button
                variant="contained"
                onClick={handleSubmit}
            >
                {value == "Otro" ? "Indexar" : "Continuar"}
            </Button>
        </Box>
    );
};

export default IndexFormSTAR;
