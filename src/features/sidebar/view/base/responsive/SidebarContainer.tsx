import { ReactNode } from "react"
import { Stack } from "@mui/material"
import Drawer from "./Drawer"
import PrimaryHeader from "../PrimaryHeader"
import SecondaryWrapper from "./SecondaryWrapper"

const SidebarContainer = ({
  isSidebarOpen,
  isCloseSidebarEnabled,
  onToggleSidebarOpen,
  sidebarHeader,
  sidebar,
  header,
  children
}: {
  isSidebarOpen: boolean,
  isCloseSidebarEnabled: boolean,
  onToggleSidebarOpen: (isSidebarOpen: boolean) => void
  sidebarHeader?: ReactNode
  sidebar: ReactNode
  header?: ReactNode
  children?: ReactNode
}) => {
  const sidebarWidth = 320
  return (
    <Stack direction="row" spacing={0} sx={{ width: "100%", height: "100%" }}>
      <Drawer
        width={sidebarWidth}
        isOpen={isSidebarOpen}
        onClose={() => onToggleSidebarOpen(false)}
      >
        <PrimaryHeader
          width={sidebarWidth}
          isCloseEnabled={isCloseSidebarEnabled}
          onClose={() => onToggleSidebarOpen(false)}
        >
          {sidebarHeader}
        </PrimaryHeader>
        {sidebar}
      </Drawer>
      <SecondaryWrapper sidebarWidth={sidebarWidth} offsetContent={isSidebarOpen}>
        {header}
        <main style={{ flexGrow: "1", overflowY: "auto" }}>
          {children}
        </main>
      </SecondaryWrapper>
    </Stack>
  )
}

export default SidebarContainer
