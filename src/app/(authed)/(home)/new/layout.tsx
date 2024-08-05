"use client"

import SecondarySplitHeader, { HEIGHT_HEADER } from "@/features/sidebar/view/SecondarySplitHeader"
import { Box } from "@mui/material"

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SecondarySplitHeader />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding={{ xs: 4 }}
        height={{md: `calc(100vh - ${HEIGHT_HEADER + 1}px)`}}
      >
        {children}
      </Box>
    </>
  )
}