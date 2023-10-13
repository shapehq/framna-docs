"use client";

import { Box, Drawer, Typography } from "@mui/material";
import { ReactNode } from "react";
import { LibraryBooks } from '@mui/icons-material';
import { SIDEBAR_SPACING } from "../style/dimensions";

interface SidebarComponentProps {
  projectListComponent: ReactNode;
  userComponent: ReactNode;
  drawerWidth: number;
  open: boolean;
  handleDrawerToggle: () => void;
}
const SidebarComponent: React.FC<SidebarComponentProps> = ({
  projectListComponent,
  userComponent,
  drawerWidth,
  open,
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
        flexDirection: "column"
      }}
    >
      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: SIDEBAR_SPACING,
          paddingBottom: 0
        }}
        sx={{
          marginBottom: "5px",
        }}
      >
        <LibraryBooks style={{ marginRight: '10px' }} />
        <Typography variant="h6">
          Projects
        </Typography>
      </Box>
      {projectListComponent}
      <Box style={{ padding: SIDEBAR_SPACING }}>
      {userComponent}
      </Box>
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
      <Drawer
        container={container}
        variant="temporary"
        open={open}
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
