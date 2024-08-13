// CustomNode.jsx
import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import { styled } from '@mui/system';
import SimpleForm from './ToolsForms/FastQC';

const NodeWrapper = styled(Paper)(({ theme, selected, color }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'grab',
  textAlign: 'center',
  backgroundColor: color,
  borderWidth: selected ? '2px' : '0px',
}));

const CustomNode = ({ data, selected }) => {
  const { name, icon, color, connectors, formData: initialFormData } = data;

  return (
    <NodeWrapper
      selected={selected}
      color={color}
      variant='outlined'
    >
      <Typography variant="h4">{icon}</Typography>
      <Typography variant="body3">{name}</Typography>
      {connectors.includes('input') && <Handle type="source" position={Position.Right} />}
      {connectors.includes('default') && (
        <>
          <Handle type="source" position={Position.Right} />
          <Handle type="target" position={Position.Left} />
        </>
      )}
      {connectors.includes('output') && <Handle type="target" position={Position.Left} />}
    </NodeWrapper>
  );
};

export default CustomNode;