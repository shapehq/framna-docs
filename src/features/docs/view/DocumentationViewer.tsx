"use client"

import Redocly from "./Redocly"
import Stoplight from "./Stoplight"
import Swagger from "./Swagger"
import DocumentationVisualizer from "@/features/settings/domain/DocumentationVisualizer"

const DocumentationViewer = ({
  visualizer,
  url
}: {
  visualizer: DocumentationVisualizer,
  url: string
}) => {
  switch (visualizer) {
  case DocumentationVisualizer.REDOCLY:
    return <Redocly url={url} />
  case DocumentationVisualizer.STOPLIGHT:
    return <Stoplight url={url} />
  case DocumentationVisualizer.SWAGGER:
    return <Swagger url={url} />
  }
}

export default DocumentationViewer
