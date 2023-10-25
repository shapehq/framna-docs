import { ReactNode } from "react"
import { Stack } from "@mui/material"
import Drawer from "./Drawer"
import PrimaryHeader from "../PrimaryHeader"
import SecondaryWrapper from "./SecondaryWrapper"

const SidebarContainer = ({
  canCloseDrawer,
  isDrawerOpen,
  onToggleDrawerOpen,
  sidebarHeader,
  sidebar,
  header,
  children
}: {
  canCloseDrawer: boolean,
  isDrawerOpen: boolean
  onToggleDrawerOpen: (isDrawerOpen: boolean) => void
  sidebarHeader?: ReactNode
  sidebar: ReactNode
  header?: ReactNode
  children?: ReactNode
}) => {
  const drawerWidth = 320
  return (
    <Stack direction="row" spacing={0} sx={{ width: "100%", height: "100%" }}>
      <Drawer
        width={drawerWidth}
        isOpen={isDrawerOpen}
        onClose={() => onToggleDrawerOpen(false)}
      >
        <PrimaryHeader
          width={drawerWidth}
          canCloseDrawer={canCloseDrawer}
          onClose={() => onToggleDrawerOpen(false)}
        >
          {sidebarHeader}
        </PrimaryHeader>
        {sidebar}
      </Drawer>
      <SecondaryWrapper drawerWidth={drawerWidth} offsetContent={isDrawerOpen}>
        {header}
        <main style={{ flexGrow: "1", overflowY: "auto" }}>
          {children}
        </main>
      </SecondaryWrapper>
    </Stack>
  )
}

export default SidebarContainer
