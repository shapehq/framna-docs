import { ReactNode } from "react"
import { Stack } from "@mui/material"
import Drawer from "./Drawer"
import SecondaryWrapper from "./SecondaryWrapper"

const SidebarContainer = ({
  isSidebarOpen,
  onToggleSidebarOpen,
  sidebar,
  header,
  children
}: {
  isSidebarOpen: boolean,
  onToggleSidebarOpen: (isSidebarOpen: boolean) => void
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
