import DocumentationViewer from "@/features/docs/view/DocumentationViewer"
import DocumentationIframe from "./DocumentationIframe"
import DocumentationVisualizer from "@/features/settings/domain/DocumentationVisualizer"
import useDocumentationVisualizer from "@/features/settings/data/useDocumentationVisualizer"

const Documentation = ({ url }: { url: string }) => {
  const [visualizer] = useDocumentationVisualizer()
  switch (visualizer) {
  case DocumentationVisualizer.REDOCLY:
  case DocumentationVisualizer.STOPLIGHT:
    return <DocumentationIframe visualizer={visualizer} url={url} />
  case DocumentationVisualizer.SWAGGER:
    return <DocumentationViewer visualizer={visualizer} url={url} />
  }
}

export default Documentation
