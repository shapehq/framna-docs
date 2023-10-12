"use client";

import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { Context, ReactNode, createContext, useState } from "react";
import React from "react";
import { ProjectRepository } from "../projects/ProjectRepository";
import { UserProviding } from "../auth/UserProviding";
import SidebarComponent from "../components/SidebarComponent";
import AppBarComponent from "../components/AppBarComponent";
import { ISettings } from "../components/SettingsComponent";
import { DocumentationVisualizer } from "../components/DocumentationViewerComponent";

interface FrontPageProps {
  projectListComponent: ReactNode;
  userComponent: ReactNode;
  children: React.ReactNode;
}

export interface IContext {
  settings: ISettings;
  setSettings: (settings: ISettings) => void;
}

export let SettingsContext: Context<IContext>;

const FrontPage: React.FC<FrontPageProps> = ({
  userComponent,
  projectListComponent,
  children,
}) => {
  const drawerWidth = 240;
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const [settings, setSettings] = useState<ISettings>({
    documentationVisualizer: DocumentationVisualizer.SWAGGER,
  });
  const contextValue: IContext = {
    settings,
    setSettings,
  };
  SettingsContext = createContext(contextValue);

  return (
    <SettingsContext.Provider value={contextValue}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBarComponent
          drawerWidth={drawerWidth}
          handleDrawerToggle={handleDrawerToggle}
          title="Docs"
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
    </SettingsContext.Provider>
  );
};

export default FrontPage;
