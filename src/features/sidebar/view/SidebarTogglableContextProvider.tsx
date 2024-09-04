"use client"

import { SidebarTogglableContext } from "@/common"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material"
import { useProjectSelection } from "@/features/projects/data"

const SidebarTogglableContextProvider = ({ children }: { children?: React.ReactNode }) => {
  const { project } = useProjectSelection()
  const theme = useTheme()
  const isDesktopLayout = useMediaQuery(theme.breakpoints.up("sm"))
  const isSidebarTogglable = !isDesktopLayout || project !== undefined
  return (
    <SidebarTogglableContext.Provider value={isSidebarTogglable}>
      {children}
    </SidebarTogglableContext.Provider>
  )
}

export default SidebarTogglableContextProvider
