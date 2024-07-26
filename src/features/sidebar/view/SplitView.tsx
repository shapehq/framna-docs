"use client"

import { useEffect } from "react"
import { Stack } from "@mui/material"
import { isMac, useKeyboardShortcut } from "@/common"
import { useSidebarOpen } from "../data"
import PrimaryContainer from "./internal/primary/Container"
import SecondaryContainer from "./internal/secondary/Container"
import Sidebar from "./internal/sidebar/Sidebar"

const SplitView = ({
  canToggleSidebar: _canToggleSidebar,
  children
}: {
  canToggleSidebar?: boolean
  children?: React.ReactNode
}) => {
  const [isSidebarOpen, setSidebarOpen] = useSidebarOpen()
  const canToggleSidebar = _canToggleSidebar !== undefined ? _canToggleSidebar : true
  useEffect(() => {
    // Show the sidebar if no project is selected.
    if (!canToggleSidebar) {
      setSidebarOpen(true)
    }
  }, [canToggleSidebar, setSidebarOpen])
  useKeyboardShortcut(event => {
    const isActionKey = isMac() ? event.metaKey : event.ctrlKey
    if (isActionKey && event.key === ".") {
      event.preventDefault()
      if (canToggleSidebar) {
        setSidebarOpen(!isSidebarOpen)
      }
    }
  }, [canToggleSidebar, setSidebarOpen])
  const sidebarWidth = 320
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
    </Stack>
  )
}

export default SplitView
