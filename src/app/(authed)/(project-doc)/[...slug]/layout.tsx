"use client"

import { Box, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import TrailingToolbarItem from "@/features/projects/view/toolbar/TrailingToolbarItem"
import MobileToolbar from "@/features/projects/view/toolbar/MobileToolbar"
import SecondaryHeaderPlaceholder from "@/features/sidebar/view/SecondarySplitHeaderPlaceholder"
import { useContext } from "react"
import { ProjectsContext } from "@/common"
import LoadingIndicator from "@/common/ui/LoadingIndicator"
import SecondarySplitHeader from "@/features/sidebar/view/SecondarySplitHeader"

export default function Page({ children }: { children: React.ReactNode }) {
  const { refreshed } = useContext(ProjectsContext)

  const theme = useTheme()
  
  return (
    <Stack sx={{ height: "100%" }}>
        <>
          {!refreshed ? <SecondaryHeaderPlaceholder/> :
            <SecondarySplitHeader mobileToolbar={<MobileToolbar/>}>
              <TrailingToolbarItem/>
            </SecondarySplitHeader>
          }
          <Box sx={{ height: "0.5px", background: theme.palette.divider }} />
          {refreshed ? 
            <main style={{ flexGrow: "1", overflowY: "auto" }}>
              {children}
            </main> : 
            <LoadingIndicator />
          }
        </>
    </Stack>
  )
}