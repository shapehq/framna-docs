import { ReactNode } from "react"
import { Box } from "@mui/material"
import Drawer from "./Drawer"
import SecondaryHeader from "./SecondaryHeader"
import SecondaryContent from "./SecondaryContent"

const SidebarContainer = ({
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
  const drawerWidth = 320
  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <SecondaryHeader
        drawerWidth={drawerWidth}
        offsetContent={isDrawerOpen}
        onOpen={() => onToggleDrawerOpen(true)}
      >
        {secondaryHeader}
      </SecondaryHeader>
      <Drawer
        width={drawerWidth}
        isOpen={isDrawerOpen}
        header={primaryHeader}
        onClose={() => onToggleDrawerOpen(false)}
      >
        {primary}
      </Drawer>
      <SecondaryContent
        drawerWidth={drawerWidth}
        offsetContent={isDrawerOpen}
      >
        {secondary}
      </SecondaryContent>
    </Box>
  )
}

export default SidebarContainer
