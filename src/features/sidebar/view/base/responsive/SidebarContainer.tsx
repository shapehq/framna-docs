import { ReactNode } from "react"
import { Box } from "@mui/material"
import Drawer from "./Drawer"
import SecondaryHeader from "./SecondaryHeader"
import SecondaryContent from "./SecondaryContent"

const SidebarContainer = ({
  isDrawerOpen,
  onToggleDrawerOpen,
  sidebarHeader,
  sidebar,
  header,
  children
}: {
  isDrawerOpen: boolean
  onToggleDrawerOpen: (isDrawerOpen: boolean) => void
  sidebarHeader?: ReactNode
  sidebar: ReactNode
  header?: ReactNode
  children?: ReactNode
}) => {
  const drawerWidth = 320
  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <SecondaryHeader
        drawerWidth={drawerWidth}
        offsetContent={isDrawerOpen}
        onOpen={() => onToggleDrawerOpen(true)}
      >
        {header}
      </SecondaryHeader>
      <Drawer
        width={drawerWidth}
        isOpen={isDrawerOpen}
        header={sidebarHeader}
        onClose={() => onToggleDrawerOpen(false)}
      >
        {sidebar}
      </Drawer>
      <SecondaryContent
        drawerWidth={drawerWidth}
        offsetContent={isDrawerOpen}
      >
        {children}
      </SecondaryContent>
    </Box>
  )
}

export default SidebarContainer
