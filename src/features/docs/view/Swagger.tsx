import { useEffect, useRef, useState } from "react"
import { Box } from "@mui/material"
import LoadingWrapper from "./LoadingWrapper"
import yaml from "yaml"

const Swagger = ({ url }: { url: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setLoading] = useState(true)
  const [spec, setSpec] = useState<string | undefined>(undefined)
    
  const unpkgUrl = "https://unpkg.com/swagger-ui-dist@5.11.0"

  useEffect(() => {
    fetch(url)
      .then(res => res.text())
      .then(text => {
        const parsedSpec = yaml.parse(text)
        setSpec(parsedSpec)
        setLoading(false)
      })
  }, [url])

  useEffect(() => {
    if (!spec || !containerRef.current) {
      return
    }

    const script = document.createElement("script")
    script.src = `${unpkgUrl}/swagger-ui-bundle.js`
    script.async = true
    script.onload = () => {
      const SwaggerUI = window.SwaggerUIBundle
      // Documentation for the configuration:
      // https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/
      SwaggerUI({
        spec: spec,
        domNode: containerRef.current,
        layout: "BaseLayout",
        deepLinking: true,
        persistAuthorization: true
      })
    }
    document.body.appendChild(script)

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = `${unpkgUrl}/swagger-ui.css`
    document.head.appendChild(link)

    return () => {
      document.body.removeChild(script)
      document.head.removeChild(link)
    }
  }, [spec])

  return (
    <LoadingWrapper showLoadingIndicator={isLoading}>
      <Box sx={{ width: "100%", height: "100%", padding: 2 }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </Box>
    </LoadingWrapper>
  )
}

export default Swagger
