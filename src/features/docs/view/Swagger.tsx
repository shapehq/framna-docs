import { useState } from "react"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"
import LoadingWrapper from "./LoadingWrapper"

const Swagger = ({ url }: { url: string }) => {
  const [isLoading, setLoading] = useState(true)
  return (
    <LoadingWrapper showLoadingIndicator={isLoading}>
      <SwaggerUI url={url} onComplete={() => setLoading(false)} deepLinking />
    </LoadingWrapper>
  )
}

export default Swagger
