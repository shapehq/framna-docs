"use client"

import { Box, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import SecondarySplitHeader from "@/features/sidebar/view/SecondarySplitHeader"
import TrailingToolbarItem from "@/features/projects/view/toolbar/TrailingToolbarItem"
import MobileToolbar from "@/features/projects/view/toolbar/MobileToolbar"
import { useProjectSelection } from "@/features/projects/data"
import NotFound from "@/features/projects/view/NotFound"

export default function Page({ children }: { children: React.ReactNode }) {
  const { project } = useProjectSelection()
  const theme = useTheme()
  return (
    <Stack sx={{ height: "100%" }}>
      {!project &&
        <>
          <SecondarySplitHeader>
            <TrailingToolbarItem/>
          </SecondarySplitHeader>
          <main style={{ flexGrow: "1", overflowY: "auto" }}>
            <NotFound />
          </main>
        </>
      }
      {project &&
        <>
          <SecondarySplitHeader mobileToolbar={<MobileToolbar/>}>
            <TrailingToolbarItem/>
          </SecondarySplitHeader>
          <Box sx={{ height: "0.5px", background: theme.palette.divider }} />
          <main style={{ flexGrow: "1", overflowY: "auto" }}>
            {children}
          </main>
        </>
      }
    </Stack>
  )
}