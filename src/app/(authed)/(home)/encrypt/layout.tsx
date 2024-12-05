import { Box, Stack } from "@mui/material"
import SecondarySplitHeader from "@/features/sidebar/view/SecondarySplitHeader"

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <Stack sx={{ height: "100%" }}>
      <SecondarySplitHeader/>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          paddingLeft: 2,
          paddingRight: 2
        }}
      >
        {children}
      </Box>
    </Stack>
  )
}