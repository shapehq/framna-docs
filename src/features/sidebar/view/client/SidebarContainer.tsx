"use client"

import dynamic from "next/dynamic"
import { ReactNode } from "react"
import Image from "next/image"
import { Box, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useSessionStorage } from "usehooks-ts"
import ResponsiveSidebarContainer from "../base/responsive/SidebarContainer"
import Sidebar from "../Sidebar"

const SidebarContainer = ({
  sidebar,
  children,
  toolbarTrailing
}: {
  sidebar?: ReactNode
  children?: ReactNode
  toolbarTrailing?: ReactNode
}) => {
  const [open, setOpen] = useSessionStorage("isDrawerOpen", true)
  const theme = useTheme()
  return (
    <ResponsiveSidebarContainer
      isDrawerOpen={open}
      onToggleDrawerOpen={setOpen}
      primaryHeader={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Image src="/duck.png" alt="Duck" width={40} height={45} priority={true}/>
        </Stack>
      }
      primary={
        <Sidebar>
          {sidebar}
        </Sidebar>
      }
      secondaryHeader={
        <>
          {toolbarTrailing != undefined && 
            <Box sx={{ 
              display: "flex",
              width: "100%",
              justifyContent: "right",
              color: theme.palette.text.primary
            }}>
              {toolbarTrailing}
            </Box>
          }
        </>
      }
      secondary={children}
    />
  )
}

// Disable server-side rendering as this component uses the window instance to manage its state.
export default dynamic(() => Promise.resolve(SidebarContainer), {
  ssr: false
})
