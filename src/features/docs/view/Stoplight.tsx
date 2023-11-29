import { useEffect, useState } from "react"
import { Box } from "@mui/material"
import { API } from "@stoplight/elements"
import "@stoplight/elements/styles.min.css"
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

const ResponsiveStoplight = ({ document }: { document: string }) => {
  return (
    <>
      <Box sx={{
        display: { xs: "block", sm: "none" },
        width: "100%",
        height: "100%",
        padding: 2 
      }}>
        <API
          apiDescriptionDocument={document}
          router="hash"
          layout="stacked"
        />
      </Box>
      <Box sx={{
        display: { xs: "none", sm: "block" },
        width: "100%",
        height: "100%",
      }}>
        <API
          apiDescriptionDocument={document}
          router="hash"
          layout="sidebar"
        />
      </Box>
    </>
  )
} 

export default Stoplight
