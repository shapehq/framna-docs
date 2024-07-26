"use client"

import { useEffect } from "react"
import { Stack } from "@mui/material"
import PrimaryContainer from "./internal/PrimaryContainer"
import SecondaryContainer from "./internal/SecondaryContainer"
import { useProjectSelection } from "@/features/projects/data"
import { useSidebarOpen } from "../data"
import Sidebar from "./Sidebar"

const SplitView = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useSidebarOpen()
  const { project } = useProjectSelection()
  const sidebarWidth = 320
  useEffect(() => {
    // Show the sidebar if no project is selected.
    if (project === undefined) {
      setSidebarOpen(true)
    }
  }, [project, setSidebarOpen])
  return (
    <Stack direction="row" spacing={0} sx={{ width: "100%", height: "100%" }}>
      <PrimaryContainer
        width={sidebarWidth}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        <Sidebar/>
      </PrimaryContainer>
      <SecondaryContainer sidebarWidth={sidebarWidth} offsetContent={isSidebarOpen}>
        {children}
      </SecondaryContainer>
      {/* <SecondaryWrapper sidebarWidth={sidebarWidth} offsetContent={isSidebarOpen}>
        {header}
        <main style={{ flexGrow: "1", overflowY: "auto" }}>
          {children}
        </main>
      </SecondaryWrapper> */}
    </Stack>
  )
}

// Disable server-side rendering as this component uses the window instance to manage its state.
// export default dynamic(() => Promise.resolve(SidebarContainer), {
//   ssr: false
// })

export default SplitView
