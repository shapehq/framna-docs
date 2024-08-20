import HighlightText from "@/common/ui/HighlightText"
import { Box, Typography } from "@mui/material"
import { BASE_COLORS } from "@/common/theme/theme"
import { env } from "@/common"
import { grey } from "@mui/material/colors"

const SITE_NAME = env.getOrThrow("NEXT_PUBLIC_SHAPE_DOCS_TITLE")

const WelcomeContent = () => {
  const title = "Welcome to "
  const description = [
    "Centralizes your OpenAPI documentation and streamlines spec-driven development"
  ]

  return (
    <>
      <HighlightText
        content={`${title} ${SITE_NAME}`}
        highlight={[SITE_NAME]}
        color={[BASE_COLORS[0]]}
        variant="h3"
        opacity={7}
        sx={{ textAlign: "center" }}
      />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        width={1}
        gap={{ xs: 6 ,md: 2}}  
        textAlign="center"    
      >
        {description.map((line, index) => (
          <Typography 
            key={`description-line-${index}`}
            sx={{
              display: { md: "flex" },
              fontSize: 20,
              color: grey[700]
            }}
          >
            {line}
          </Typography>
        ))}
      </Box>
    </>
  )
}

export default WelcomeContent