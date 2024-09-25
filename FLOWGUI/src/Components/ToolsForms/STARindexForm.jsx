// SimpleForm.jsx
import React, { Fragment } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import FileDropZone from '../Uploadfile';
import { FormControl, Box, Button, FormControlLabel, Radio, RadioGroup, FormLabel, TextField } from '@mui/material';

const IndexFormSTAR = ({ formData, onFormDataChange, setLoading, loading, handleChangeTab, id }) => { 
    
    const [value, setValue] = React.useState(formData.indexing);

    const handleSubmit = async () => {
        handleChangeTab("2")
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
                    <FileDropZone 
                        handleChangeTab={handleChangeTab}
                        loading={loading}
                        setLoading={setLoading}
                        formData={formData}
                        onFormDataChange={onFormDataChange}
                        id={id}
                    >
                    </FileDropZone>
                }
            </FormControl>

            {value != "Otro" &&
            <Button
                variant="contained"
                onClick={handleSubmit}
            >
                {"Continuar"}
            </Button>}
        </Box>
    );
};

export default IndexFormSTAR;
