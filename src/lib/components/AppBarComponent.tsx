import { Menu } from "@mui/icons-material";
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import { ReactNode } from "react";

interface AppBarComponentProps {
  drawerWidth: number;
  handleDrawerToggle: () => void;
  title: string;
  versionSelectorComponent?: ReactNode;
}

const AppBarComponent: React.FC<AppBarComponentProps> = ({
  drawerWidth,
  handleDrawerToggle,
  title,
  versionSelectorComponent,
}) => {
  return (
    <AppBar
      position="fixed"
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
        <Typography variant="h6" noWrap component="div">
          {title}
        </Typography>
        {versionSelectorComponent ? versionSelectorComponent : <></>}
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
