"use client";

import { Divider, Box, Drawer, Typography } from "@mui/material";
import { ReactNode } from "react";
import { SIDEBAR_SPACING } from "../style/dimensions";
import SettingsComponent from "./SettingsComponent";

interface SidebarComponentProps {
  projectListComponent: ReactNode;
  userComponent: ReactNode;
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}
const SidebarComponent: React.FC<SidebarComponentProps> = ({
  projectListComponent,
  userComponent,
  drawerWidth,
  mobileOpen,
  handleDrawerToggle,
}) => {
  const container =
    window !== undefined ? () => window.document.body : undefined;
  const drawer = (
    <Box
      component="div"
      sx={{
        display: "flex",
        height: "100vh",
        justifyContent: "space-between",
        flexDirection: "column",
        padding: SIDEBAR_SPACING,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: "10px",
        }}
      >
        Projects
      </Typography>
      <Divider />
      {projectListComponent}
      <Divider />
      <SettingsComponent />
      <Divider />
      {userComponent}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
      }}
    >
      {/* Mobile drawer*/}
      <Drawer
        container={container}
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      {/* Desktop drawer*/}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default SidebarComponent;
