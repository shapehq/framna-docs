import { useEffect, useState, createElement } from "react"
import { Box } from "@mui/material"
import LoadingWrapper from "./LoadingWrapper"

const Stoplight = ({ url }: { url: string }) => {
  // The Stoplight component does not provide a callback to let us know
  // when loading ends so in order to show our loading indicator, we load
  // the specification before showing the Stoplight component.
  const [document, setDocument] = useState<string | undefined>(undefined)
  const [isLoading, setLoading] = useState(true)
  useEffect(() => {
    fetch(url)
      .then(res => res.text())
      .then(data => {
        setDocument(data)
        setLoading(false)
      })
  }, [url])
  return (
    <LoadingWrapper showLoadingIndicator={isLoading}>
      {!isLoading && document &&
        <ResponsiveStoplight document={document} />
      }
    </LoadingWrapper>
  )
}

const ResponsiveStoplight = ({ document: apiDescriptionDocument }: { document: string }) => {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://unpkg.com/@stoplight/elements@9.0.0/web-components.min.js"
    script.async = true
    document.body.appendChild(script)
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/@stoplight/elements@9.0.0/styles.min.css"
    document.head.appendChild(link)
    return () => {
      document.body.removeChild(script)
      document.head.removeChild(link)
    }
  }, [])
  return (
    <>
      <Box sx={{
        display: { xs: "block", sm: "none" },
        width: "100%",
        height: "100%",
        padding: 2 
      }}>
        <ElementsAPI document={apiDescriptionDocument} layout="stacked" />
      </Box>
      <Box sx={{
        display: { xs: "none", sm: "block" },
        width: "100%",
        height: "100%",
      }}>
        <ElementsAPI document={apiDescriptionDocument} layout="sidebar" />
      </Box>
    </>
  )
}

const ElementsAPI = ({
  document: apiDescriptionDocument,
  layout
}: {
  document: string,
  layout: "sidebar" | "stacked"
}) => {
  return createElement("elements-api", {
      apiDescriptionDocument,
      router: "hash",
      layout: layout
    })
}

export default Stoplight
