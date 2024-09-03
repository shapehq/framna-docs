import { Box, Stack } from "@mui/material"
import SecondarySplitHeader from "@/features/sidebar/view/SecondarySplitHeader"

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <Stack sx={{ height: "100%" }}>
      <SecondarySplitHeader showDivider={false} />
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {children}
      </Box>
    </Stack>
  )
}