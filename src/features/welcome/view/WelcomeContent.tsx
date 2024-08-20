import { Box, Typography } from "@mui/material"
import { grey } from "@mui/material/colors"
import { env } from "@/common"

const SITE_NAME = env.getOrThrow("NEXT_PUBLIC_SHAPE_DOCS_TITLE")

const WelcomeContent = () => {
  return (
    <Box component="span">
      <Typography variant="body2" color={grey[700]} component="span">
        Welcome to&nbsp;
      </Typography>
      <Typography variant="body2" component="span" fontWeight="medium">
        {SITE_NAME}
      </Typography>
      <Typography variant="body2" color={grey[700]} component="span">
        , a central place for your OpenAPI documentation.
      </Typography>
    </Box>
  )
}

export default WelcomeContent