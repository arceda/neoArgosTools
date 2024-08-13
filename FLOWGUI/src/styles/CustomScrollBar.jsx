import { GlobalStyles } from '@mui/material';

const CustomScrollbarStyles = () => (
  <GlobalStyles
    styles={{
      '*::-webkit-scrollbar': {
        width: '10px',
      },
      '*::-webkit-scrollbar-thumb': {
        background: 'rgba(200, 200, 200, 0.4)', // Semi-transparent grey
        borderRadius: '10px',
        border: '2px solid rgba(255, 255, 255, 0.3)', // Glassy effect
      },
      '*::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(200, 200, 200, 0.8)', // Slightly more opaque on hover
      },
      '*::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.2)', // Transparent track
        borderRadius: '10px',
      },
    }}
  />
);

export default CustomScrollbarStyles;