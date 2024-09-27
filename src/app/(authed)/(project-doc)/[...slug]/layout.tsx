"use client"

import { useContext } from "react"
import { Box, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import TrailingToolbarItem from "@/features/projects/view/toolbar/TrailingToolbarItem"
import MobileToolbar from "@/features/projects/view/toolbar/MobileToolbar"
import { useProjectSelection } from "@/features/projects/data"
import { ProjectsContext } from "@/common"
import SecondaryHeaderPlaceholder from "@/features/sidebar/view/SecondarySplitHeaderPlaceholder"
import SecondarySplitHeader from "@/features/sidebar/view/SecondarySplitHeader"

export default function Page({ children }: { children: React.ReactNode }) {
  const { cached } = useContext(ProjectsContext)
  const { project } = useProjectSelection()
  const theme = useTheme()
  return (
    <Stack sx={{ height: "100%" }}>
      <>
        {project &&
          <SecondarySplitHeader mobileToolbar={<MobileToolbar/>}>
            <TrailingToolbarItem/>
          </SecondarySplitHeader>
        }
        {!project && cached && <SecondaryHeaderPlaceholder/>}
        <Box sx={{ height: "0.5px", background: theme.palette.divider }} />
        <main style={{ flexGrow: "1", overflowY: "auto" }}>
          {children}
        </main>
      </>
    </Stack>
  )
}