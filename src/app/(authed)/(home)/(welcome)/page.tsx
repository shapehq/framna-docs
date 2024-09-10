import { Box, Typography } from "@mui/material"
import { grey } from "@mui/material/colors"
import { env } from "@/common"

const SITE_NAME = env.getOrThrow("FRAMNA_DOCS_TITLE")

const Page = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      sx={{ height: "100%" }}
    >
      <Box component="span" sx={{ textAlign: "center" }}>
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
    </Box>
  )
}

export default Page

