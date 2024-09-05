import { Box, Typography } from "@mui/material"
import HighlightText from "@/common/ui/HighlightText"

export default function NotFound() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      textAlign="center"    
      height={1}
      width={1}
      gap={8}
      padding={{ xs: 4, md: 0 }}
    >
      <HighlightText
        content="Oops! Page Not Found"
        highlight={["Page Not Found"]}
        variant="h4"
        sx={{ textAlign: "center" }}
      />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        textAlign="center"
        gap={1  }
      >
        <Typography>
          We couldn&apos;t find the project or page you&apos;re looking for.
        </Typography>
        <Typography>
          The page might have been moved or doesn&apos;t exist.
        </Typography>
      </Box>
    </Box>
  )
}