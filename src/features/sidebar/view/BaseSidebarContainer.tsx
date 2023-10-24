import { ReactNode } from "react"
import { Box, Drawer, Divider, IconButton, Toolbar } from "@mui/material"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import { ChevronLeft, Menu } from "@mui/icons-material"
import { styled, useTheme } from "@mui/material/styles"

const drawerWidth = 320

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean
}>(({ theme, open }) => ({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  overflowY: "auto",
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  })
}))

const DrawerHeaderWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}))

const DrawerHeader = ({
  primaryHeader,
  handleDrawerClose
}: {
  primaryHeader: ReactNode,
  handleDrawerClose: () => void
}) => {
  return (
    <DrawerHeaderWrapper>
      <IconButton
        onClick={handleDrawerClose}
        sx={{ marginLeft: "2px", zIndex: 1000 }}
      >
        <ChevronLeft />
      </IconButton>
      {primaryHeader != null && 
        <Box sx={{ 
          position: "fixed",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: `${drawerWidth}px`
        }}>
          {primaryHeader}
        </Box>
      }
    </DrawerHeaderWrapper>
  )
}

interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const BaseSidebarContainer = ({
  isDrawerOpen,
  onToggleDrawerOpen,
  primaryHeader,
  primary,
  secondaryHeader,
  secondary
}: {
  isDrawerOpen: boolean
  onToggleDrawerOpen: (isDrawerOpen: boolean) => void
  primaryHeader?: ReactNode
  primary: ReactNode
  secondaryHeader?: ReactNode
  secondary: ReactNode
}) => {
  const theme = useTheme()
  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <AppBar
        position="fixed"
        open={isDrawerOpen}
        elevation={0}
        sx={{backgroundColor: theme.palette.background.default}}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => onToggleDrawerOpen(true)}
            edge="start"
            sx={{
              mr: 2,
              color: theme.palette.text.primary,
              ...(isDrawerOpen && { display: "none" })
            }}
          >
            <Menu/>
          </IconButton>
          {secondaryHeader != null && secondaryHeader}
        </Toolbar>
        <Divider />
      </AppBar>
      <Drawer
        variant="persistent"
        anchor="left"
        open={isDrawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <DrawerHeader
          handleDrawerClose={() => onToggleDrawerOpen(false)}
          primaryHeader={primaryHeader}
        />
        {primary}
      </Drawer>
      <Main open={isDrawerOpen}>
        <Toolbar/>
        <Box sx={{ overflowY: "scroll" }}>
          {secondary}
        </Box>
      </Main>
    </Box>
  )
}

export default BaseSidebarContainer
