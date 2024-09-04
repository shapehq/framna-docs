"use client"

import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material"
import useSidebarOpen from "./useSidebarOpen"

export default function useCloseSidebarOnSelection() {
  const theme = useTheme()
  const isDesktopLayout = useMediaQuery(theme.breakpoints.up("sm"))
  const [, setSidebarOpen] = useSidebarOpen()
  return {
    closeSidebarIfNeeded: () => {
      if (!isDesktopLayout) {
        setSidebarOpen(false)
      }
    }
  }
}
