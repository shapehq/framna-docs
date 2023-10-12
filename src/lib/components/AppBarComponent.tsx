import { Menu } from "@mui/icons-material";
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";

interface AppBarComponentProps {
  drawerWidth: number;
  handleDrawerToggle: () => void;
  title: string;
}

const AppBarComponent: React.FC<AppBarComponentProps> = ({
  drawerWidth,
  handleDrawerToggle,
  title,
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
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
