import { useState } from "react"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"
import { Box } from "@mui/material"
import LoadingWrapper from "./LoadingWrapper"
import "./swagger.css"

const Swagger = ({ url }: { url: string }) => {
  const [isLoading, setLoading] = useState(true)
  return (
    <LoadingWrapper showLoadingIndicator={isLoading}>
      <Box sx={{ paddingBottom: 1 }}>
        <SwaggerUI url={url} onComplete={() => setLoading(false)} deepLinking persistAuthorization />
      </Box>
    </LoadingWrapper>
  )
}

export default Swagger
