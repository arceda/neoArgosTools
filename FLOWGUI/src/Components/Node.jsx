import React from 'react';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import { styled } from '@mui/system';

const NodeWrapper = styled(Paper)(({ theme, selected, color }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'grab',
  textAlign: 'center',
  backgroundColor: color,
  borderWidth: selected ? '2px' : '0px',
  width: '70px'
}));

const onDragStart = (event, nodeData) => {
  //var {form, ...newNodeData} = nodeData
  event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
  event.dataTransfer.effectAllowed = 'move';
};

const DraggableNode = ({ name, icon, color, connectors, form, formData }) => (
  <NodeWrapper
    color={color}
    variant='outlined'
    onDragStart={(event) => onDragStart(event, { name, icon, color, connectors, form, formData })}
    draggable
  >
    <Typography variant="h4">{icon}</Typography>
    <Typography variant="body3">{name}</Typography>
  </NodeWrapper>
);

export default DraggableNode;
