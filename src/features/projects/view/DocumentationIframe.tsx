import { useState } from "react"
import { Box } from "@mui/material"
import LoadingIndicator from "@/common/loading/LoadingIndicator"
import DocumentationVisualizer from "@/features/settings/domain/DocumentationVisualizer"

const DocumentationIframe = ({
  visualizer,
  url
}: {
  visualizer: DocumentationVisualizer,
  url: string
}) => {
  const [isIframeLoaded, setIframeLoaded] = useState(false)
  const searchParams = new URLSearchParams()
  searchParams.append("visualizer", visualizer.toString())
  searchParams.append("url", url)
  return (
      <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
        <iframe
          src={`/documentation-viewer?${searchParams.toString()}`}
          style={{ width: "100%", height: "100%", position: "absolute" }}
          onLoad={() => { setIframeLoaded(true) }}
        />
        {!isIframeLoaded && <LoadingIndicator/>}
      </Box>
  )
}

export default DocumentationIframe
