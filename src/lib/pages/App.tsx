"use client";

import { Box, CssBaseline } from "@mui/material";
import { ReactNode, useState } from "react";
import React from "react";
import SidebarComponent from "../components/SidebarComponent";
import AppBarComponent from "../components/AppBarComponent";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ffffff',
      light: '#3b1490',
      dark: '#2b262a',
      contrastText: 'rgba(0,0,0,0.87)',
    },
    secondary: {
      main: '#FF4D5B',
      light: '#FF4D5B',
      dark: '#FF4D5B',
    },
    error: {
      main: '#a8101e',
    },
    warning: {
      main: '#e8c01e',
    },
    success: {
      main: '#47a84c',
    },
    info: {
      main: '#17a0f1',
    },
  },
  typography: {
    button: {
      textTransform: 'none'
    }
  }
})

interface AppProps {
  projectListComponent: ReactNode;
  userComponent: ReactNode;
  versionSelectorComponent?: ReactNode;
  children: ReactNode;
}

const App: React.FC<AppProps> = ({
  userComponent,
  projectListComponent,
  versionSelectorComponent,
  children,
}) => {
  const drawerWidth = 320;
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerToggle = () => {
    setDrawerOpen(!isDrawerOpen);
  };
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBarComponent
          drawerWidth={isDrawerOpen ? drawerWidth : 0}
          handleDrawerToggle={handleDrawerToggle}
          versionSelectorComponent={versionSelectorComponent}
        />
        <SidebarComponent
          userComponent={userComponent}
          projectListComponent={projectListComponent}
          drawerWidth={drawerWidth}
          handleDrawerToggle={handleDrawerToggle}
          open={isDrawerOpen}
        />
        <Box style={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
