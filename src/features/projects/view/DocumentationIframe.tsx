import { Box } from "@mui/material"
import DelayedLoadingIndicator from "@/common/loading/DelayedLoadingIndicator"
import DocumentationVisualizer from "@/features/settings/domain/DocumentationVisualizer"

const DocumentationIframe = ({
  visualizer,
  url
}: {
  visualizer: DocumentationVisualizer,
  url: string
}) => {
  const searchParams = new URLSearchParams()
  searchParams.append("visualizer", visualizer.toString())
  searchParams.append("url", url)
  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <Box sx={{ width: "100%", height: "100%", position: "absolute" }}>
        <DelayedLoadingIndicator/>
      </Box>
      <iframe
        src={`/documentation-viewer?${searchParams.toString()}`}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      />
    </Box>
  )
}

export default DocumentationIframe
