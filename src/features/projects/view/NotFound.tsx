import Link from 'next/link'
import { BASE_COLORS } from "@/common/theme/theme"
import { Box, Typography, Button } from "@mui/material"
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
      padding={{ xs: 4, md: 0}}
    >
      <HighlightText
        content="Oops! Page Not Found"
        highlight={["Page Not Found"]}
        color={[BASE_COLORS[2]]}
        variant="h3"
        opacity={7}
        sx={{ textAlign: "center" }}
      />
      <Typography 
        sx={{
          display: { md: "flex" },
          fontSize: 20,
        }}
      >
        We couldn&apos;t find the project or page you&apos;re looking for.
        It might have been moved or doesn&apos;t exist.
      </Typography>
      <Button
        id="create-repository"
        type="button"
        component={Link}
        href="/"
        variant="contained"
        color="primary"
        size="large"
        sx={{ height: 56, width: 300 }}
      >
        Return to Home
      </Button>
    </Box>
  )
}