import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

const Swagger = ({ url }: { url: string }) => {
  return <SwaggerUI url={url} />
}

export default Swagger
