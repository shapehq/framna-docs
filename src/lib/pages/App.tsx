"use client";

import { Box, CssBaseline, Toolbar } from "@mui/material";
import { Context, ReactNode, createContext, useState } from "react";
import React from "react";
import SidebarComponent from "../components/SidebarComponent";
import AppBarComponent from "../components/AppBarComponent";
import { ISettings } from "../components/SettingsComponent";
import { DocumentationVisualizer } from "../components/DocumentationViewerComponent";
import DocumentationViewerPage from "./DocumentationViewerPage";
import { IProject } from "../projects/IProject";

interface AppProps {
  projectListComponent: ReactNode;
  userComponent: ReactNode;
  versionSelectorComponent?: ReactNode;
  openApiSpecificationsComponent?: ReactNode;
  children: ReactNode;
}

const App: React.FC<AppProps> = ({
  userComponent,
  projectListComponent,
  versionSelectorComponent,
  openApiSpecificationsComponent,
  children,
}) => {
  const drawerWidth = 240;
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBarComponent
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        title="Docs"
        versionSelectorComponent={versionSelectorComponent}
        openApiSpecificationsComponent={openApiSpecificationsComponent}
      />
      <SidebarComponent
        userComponent={userComponent}
        projectListComponent={projectListComponent}
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        mobileOpen={mobileOpen}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default App;
