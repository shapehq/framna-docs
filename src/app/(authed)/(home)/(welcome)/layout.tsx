"use client"

import SecondarySplitHeader from "@/features/sidebar/view/SecondarySplitHeader"
import { Box } from "@mui/material"

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Box width={1} display={{ xs: "flex", sm: "flex", md: "none"}} paddingLeft={{ xs: 2 }}>
        <SecondarySplitHeader showDivider={false} />
      </Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding={{ xs: 4 }}
        height={1}
      >
        {children}
      </Box>
    </>
  )
}