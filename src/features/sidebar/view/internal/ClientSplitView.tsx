"use client"

import { useEffect } from "react"
import { Stack } from "@mui/material"
import { isMac, useKeyboardShortcut } from "@/common"
import { useSidebarOpen } from "../../data"
import { useProjectSelection } from "@/features/projects/data"
import PrimaryContainer from "./primary/Container"
import SecondaryContainer from "./secondary/Container"

const ClientSplitView = ({
  sidebar,
  children
}: {
  sidebar: React.ReactNode
  children?: React.ReactNode
}) => {
  const [isSidebarOpen, setSidebarOpen] = useSidebarOpen()
  const { project } = useProjectSelection()
  const canToggleSidebar = project !== undefined
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
        {sidebar}
      </PrimaryContainer>
      <SecondaryContainer sidebarWidth={sidebarWidth} offsetContent={isSidebarOpen}>
        {children}
      </SecondaryContainer>
    </Stack>
  )
}

export default ClientSplitView
