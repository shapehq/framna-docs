"use client"

import { Box, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import TrailingToolbarItem from "@/features/projects/view/toolbar/TrailingToolbarItem"
import MobileToolbar from "@/features/projects/view/toolbar/MobileToolbar"
import SecondarySplitHeader from "@/features/sidebar/view/SecondarySplitHeader"

export default function Page({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  
  return (
    <Stack sx={{ height: "100%" }}>
        <>
          <SecondarySplitHeader mobileToolbar={<MobileToolbar/>}>
            <TrailingToolbarItem/>
          </SecondarySplitHeader>
          <Box sx={{ height: "0.5px", background: theme.palette.divider }} />        
          <main style={{ flexGrow: "1", overflowY: "auto" }}>
            {children}
          </main>
        </>
    </Stack>
  )
}