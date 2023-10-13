"use client";

import { Menu } from "@mui/icons-material";
import { AppBar, Toolbar, IconButton, Box, Divider } from "@mui/material";
import { ReactNode } from "react";
import Image from "next/image";
import ShapeLogo from "../../../public/shape2023.svg";

interface AppBarComponentProps {
  drawerWidth: number;
  handleDrawerToggle: () => void;
  versionSelectorComponent?: ReactNode;
  openApiSpecificationsComponent?: ReactNode;
}

const AppBarComponent: React.FC<AppBarComponentProps> = ({
  drawerWidth,
  handleDrawerToggle,
  versionSelectorComponent,
  openApiSpecificationsComponent,
}) => {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            mr: 2,
            display: { sm: "none" },
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Menu />
        </IconButton>
      </Toolbar>
      <Box
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image src={ShapeLogo} alt="Shape logo" />
        {versionSelectorComponent ?? <></>}
        {openApiSpecificationsComponent ?? <></>}
      </Box>
      <Divider />
    </AppBar>
  );
};

export default AppBarComponent;
