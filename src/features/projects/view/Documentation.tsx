import DocumentationViewer from "@/features/docs/view/DocumentationViewer"
import DocumentationIframe from "./DocumentationIframe"
import { DocumentationVisualizer } from "@/features/settings/domain"
import { useDocumentationVisualizer } from "@/features/settings/data"

const Documentation = ({ url }: { url: string }) => {
  const [visualizer] = useDocumentationVisualizer()
  switch (visualizer) {
  case DocumentationVisualizer.REDOCLY:
    return <DocumentationIframe visualizer={visualizer} url={url} />
  case DocumentationVisualizer.SWAGGER:
    return <DocumentationViewer visualizer={visualizer} url={url} />
  }
}

export default Documentation
