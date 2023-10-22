import Swagger from "./Swagger"
import Redocly from "./Redocly"
import DocumentationVisualizer from "@/features/settings/domain/DocumentationVisualizer"
import useDocumentationVisualizer from "@/features/settings/data/useDocumentationVisualizer"

const DocumentationViewer = ({ url }: { url: string }) => {
  const [documentationVisualizer] = useDocumentationVisualizer()
  switch (documentationVisualizer) {
  case DocumentationVisualizer.SWAGGER:
    return <Swagger url={url} />
  case DocumentationVisualizer.REDOCLY:
    return <Redocly url={url} />
  }
}

export default DocumentationViewer
