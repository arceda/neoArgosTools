import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Fragment } from 'react';
import { Box, Typography, List, ListItem , Button} from '@mui/material';
import { useDropzone } from 'react-dropzone';

const FileDropZone = ({handleChangeTab, loading, setLoading, formData, onFormDataChange, id}) => {

    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        accept: {
            'application/x-gtf': ['.gtf'],
            'application/x-fasta': ['.fasta', '.fa'],
        },
        multiple: true,
        onDrop: async (files) => {
            if (loading) {
                // Prevent further actions if already loading
                return;
            }
    
            setLoading(true);
    
            // Handle file assignment to formData
            const gtfFile = files.find(file => file.name.endsWith('.gtf'));
            const fastaFile = files.find(file => file.name.endsWith('.fasta') || file.name.endsWith('.fa'));
    
            try {
                await handleSubmit(files);

                onFormDataChange({
                    ...formData,
                    indexing: id ? id : '',
                    sjdbGTF: gtfFile ? gtfFile.name : '',
                    genomefasta: fastaFile ? fastaFile.name : '',
                });
            } catch (err) {
                console.error('Error in handleSubmit:', err);
            } finally {
                setLoading(false);
            }
        },
    });

    const files = acceptedFiles.map((file) => (
        <ListItem key={file.path}>
        {file.path} - {file.size} bytes
        </ListItem>
    ));

    const handleIndexing = async () => {
        console.log(formData)
        setLoading(true)
        try {
            console.log(formData)
            const response = await axios.post('http://localhost:5000/indexing', {
                node_name: formData.indexing,
                genome_fasta_file: formData.genomefasta,
                sjdbGTF_file: formData.sjdbGTF,
            });

            if (response.data.status === 1) {
                setLoading(false);
                handleChangeTab("2")
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
    }

    const handleSubmit = async (filesSubmitted) => {
        setLoading(true);
        
        // Iterate through each file and send it individually
        try {
            for (const file of filesSubmitted) {
                const formData = new FormData();
                formData.append('save_dir_name', id);
                formData.append('file', file);

                for (let [key, value] of formData.entries()) {
                    console.log(value);
                }

                console.log(file)
        
                const response = await axios.post('http://localhost:5000/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
        
                if (response.status === 200) {
                console.log(`File ${file.path} uploaded successfully:`, response.data);
                // Optionally, handle additional logic per file upload
                } else {
                console.error(`Error uploading file ${file.path}:`, response.data);
                // Optionally, show an error message
                }
            }

            toast.success("Data loaded")
            setLoading(false);

        } catch (err) {
            setLoading(false);
            console.error('Error uploading files:', err.response ? err.response.data : err.message);
            toast.error(err.message)
        }
    };

    return (
        <Fragment>
            <Box sx={{ padding: 2 }}>
                <Box
                    {...getRootProps()}
                    sx={{
                    border: '2px dashed #cccccc',
                    borderRadius: '8px',
                    padding: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#f5f5f5',
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                        backgroundColor: '#e0e0e0',
                    },
                    }}
                >
                    <input {...getInputProps()} />
                    <Typography variant="h6">
                        Drag 'n' drop some files here, or click to select files
                    </Typography>
                </Box>
                {acceptedFiles.length > 0 && (
                    <Box sx={{ marginTop: 2 }}>
                    <Typography variant="h6">Files</Typography>
                    <List>{files}</List>
                    </Box>
                )}
            </Box>

            <Button
                variant="contained"
                onClick={handleIndexing}
            >
                Indexar
            </Button>

        </Fragment>
    );
};

export default FileDropZone;