import * as React from 'react';
import { Fragment } from 'react';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';

import DraggableNode from './Node';

import { items } from '../js/itemsInfo';

const drawerWidth = 300; // Default drawer width
const minDrawer = 120;

export default function SideBarMUI() {
    return (
        <Drawer
            sx={{
                width: { xs: minDrawer, sm: drawerWidth }, // Responsive drawer width
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: { xs: minDrawer, sm: drawerWidth }, // Responsive drawer width
                    boxSizing: 'border-box',
                    backgroundColor: 'transparent',
                },
            }}
            variant="permanent"
            anchor="left"
            className='drawerBackground'
            PaperProps={{ elevation: 16 }}
        >
            <Toolbar>
                <Typography variant='h6' sx={{ flexGrow: 1, textAlign: 'center' }} fontWeight='bold'>
                    Tools
                </Typography>
            </Toolbar>
            <Divider />


            {items.map((item, index) => (
                <Fragment key={index}>
                <Toolbar>
                    <Typography variant='body1' sx={{ flexGrow: 1, textAlign: 'center' }}>
                        {item.name}
                    </Typography>
                </Toolbar>
                <Box sx={{ mb: 2, ml:2, mr: 2}}>
                    <Grid
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="flex-start"
                        spacing={2}
                    >
                        {item.nodes.map((node, index) => (
                            <Grid item xs={12} sm={5} key={index}>
                                <DraggableNode 
                                    name={node.data.name}
                                    icon={node.data.icon}
                                    color={node.data.color}
                                    connectors={node.data.connectors}
                                    form={node.data.form}
                                    formData={node.data.formData}
                                />
                            </Grid>
                        ))}

                        <Grid item>
                        </Grid>
                    </Grid>
                </Box>
                <Divider />
                </Fragment>
            ))}

        </Drawer>
    );
}
