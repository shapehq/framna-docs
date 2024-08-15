import SecondarySplitHeader from "@/features/sidebar/view/SecondarySplitHeader"
import { Box, Stack } from "@mui/material"

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <Stack sx={{ height: "100%" }}>
      <Box width={1} display={{ xs: "flex", sm: "flex", md: "none" }}>
        <SecondarySplitHeader showDivider={false} />
      </Box>
      <Box sx={{
        flexGrow: 1,
        overflowY: "auto",
        alignItems: "center",
        justifyContent: "center",
        padding: { xs: 4, sm: 0 }
      }}>
        {children}
      </Box>
    </Stack>
  )
}