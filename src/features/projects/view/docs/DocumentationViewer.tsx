"use client"

import { useEffect } from "react"
import { Events } from "@/common/events/BaseEvent"
import { subscribe, unsubscribe } from "@/common/events/utils"
import { useForceUpdate } from "@/common/useForceUpdate"
import { settingsStore } from "@/common/client/startup"
import Swagger from "./Swagger"
import Redocly from "./Redocly"
import DocumentationVisualizer from "@/features/settings/domain/DocumentationVisualizer"

const DocumentationViewer: React.FC<{ url: string }> = ({ url }) => {
  const forceUpdate = useForceUpdate()
  const visualizer = settingsStore.documentationVisualizer

  useEffect(() => {
    subscribe(Events.SETTINGS_CHANGED, forceUpdate)
    return () => {
      unsubscribe(Events.SETTINGS_CHANGED, forceUpdate)
    }
  })

  switch (visualizer.toString()) {
  case DocumentationVisualizer.SWAGGER.toString():
    return <Swagger url={url} />
  case DocumentationVisualizer.REDOCLY.toString():
    return <Redocly url={url} />
  }
}

export default DocumentationViewer
