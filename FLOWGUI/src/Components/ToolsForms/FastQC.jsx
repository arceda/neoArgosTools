import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

const SimpleForm = ({formData, onFormDataChange}) => {

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
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        required
      />
      <TextField
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        required
      />
    </Box>
  );
};

export default SimpleForm;