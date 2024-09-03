"use client"

import { Stack } from "@mui/material"
import SecondarySplitHeader from "@/features/sidebar/view/SecondarySplitHeader"
import TrailingToolbarItem from "@/features/projects/view/toolbar/TrailingToolbarItem"
import MobileToolbar from "@/features/projects/view/toolbar/MobileToolbar"
import { useProjectSelection } from "@/features/projects/data"
import NotFound from "@/features/projects/view/NotFound"

export default function Page({ children }: { children: React.ReactNode }) {
  const { project } = useProjectSelection()
  return (
    <Stack sx={{ height: "100%" }}>
      {!project &&
        <>
          <SecondarySplitHeader showDivider={false} >
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
          <main style={{ flexGrow: "1", overflowY: "auto" }}>
            {children}
          </main>
        </>
      }
    </Stack>
  )
}