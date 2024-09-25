// SimpleForm.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import IndexFormSTAR from './STARindexForm';
import ProcessFormSTAR from './STARprocessForm';

const SimpleFormSTAR = ({ formData, onFormDataChange, setLoading, loading, id, sources}) => {    
    const [value, setValue] = React.useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: 300, m:1}}>
        <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
                <Tab label="INDEXAR" value="1" />
                <Tab label="PROCESAR" value="2" />
            </TabList>
            </Box>
            <TabPanel value="1">
                <IndexFormSTAR
                    formData={formData}
                    onFormDataChange={onFormDataChange}
                    setLoading={setLoading}
                    loading={loading}
                    handleChangeTab={setValue}
                    id={id}
                />
            </TabPanel>
            <TabPanel value="2">
                <ProcessFormSTAR
                    formData={formData}
                    onFormDataChange={onFormDataChange}
                    setLoading={setLoading}
                    sources={sources}
                />
            </TabPanel>
        </TabContext>

        </Box>
    );
};

export default SimpleFormSTAR;
