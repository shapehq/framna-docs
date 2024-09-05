import { useState, useEffect, useRef } from "react"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"
import { Box } from "@mui/material"
import LoadingWrapper from "./LoadingWrapper"

const Swagger = ({ url }: { url: string }) => {
  const [isLoading, setLoading] = useState(true)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleComplete = () => {
    // Clear any existing debounce timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }
    // Set a debounce delay to wait before updating the loading state
    debounceTimeout.current = setTimeout(() => {
      setLoading(false)
    }, 1200)
  }
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  return (
    <LoadingWrapper showLoadingIndicator={isLoading}>
      <Box sx={{ paddingBottom: 1 }}>
        <SwaggerUI
          url={url}
          onComplete={handleComplete}
          deepLinking
          persistAuthorization
        />
      </Box>
    </LoadingWrapper>
  )
}

export default Swagger