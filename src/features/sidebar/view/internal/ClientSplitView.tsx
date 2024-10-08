"use client"

import { useEffect, useContext } from "react"
import { Stack, useMediaQuery, useTheme } from "@mui/material"
import { isMac, useKeyboardShortcut, SidebarTogglableContext } from "@/common"
import { useSidebarOpen } from "../../data"
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
  const isSidebarTogglable = useContext(SidebarTogglableContext)
  const theme = useTheme()
  // Determine if the screen size is small or larger
  const isSM = useMediaQuery(theme.breakpoints.up("sm"))

  useEffect(() => {
    if (!isSidebarTogglable && !isSidebarOpen) {
      setSidebarOpen(true)
    }
  }, [isSidebarOpen, isSidebarTogglable, setSidebarOpen])
  useKeyboardShortcut(event => {
    const isActionKey = isMac() ? event.metaKey : event.ctrlKey
    if (isActionKey && event.key === ".") {
      event.preventDefault()
      if (isSidebarTogglable) {
        setSidebarOpen(!isSidebarOpen)
      }
    }
  }, [isSidebarTogglable, setSidebarOpen])
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
      <SecondaryContainer isSM={isSM} sidebarWidth={sidebarWidth} offsetContent={isSidebarOpen}>
        {children}
      </SecondaryContainer>
    </Stack>
  )
}

export default ClientSplitView
