"use client";

import SwaggerComponent from "./SwaggerComponent";
import RedoclyComponent from "./RedoclyComponent";
import { getSettings } from "../utils/SettingsUtils";
import { subscribe, unsubscribe } from "../utils/EventsUtils";
import { Events } from "../events/BaseEvent";
import { useEffect } from "react";
import { useForceUpdate } from "../utils/Hooks";

export enum DocumentationVisualizer {
  SWAGGER,
  REDOCLY,
}

export interface DocumentationViewerComponentProps {
  url: string;
}

const DocumentationViewerComponent: React.FC<
  DocumentationViewerComponentProps
> = ({ url }) => {
  const forceUpdate = useForceUpdate();
  const visualizer = getSettings().documentationVisualizer;

  useEffect(() => {
    subscribe(Events.SETTINGS_CHANGED, forceUpdate);
    return () => {
      unsubscribe(Events.SETTINGS_CHANGED, forceUpdate);
    };
  });

  switch (visualizer.toString()) {
    case DocumentationVisualizer.SWAGGER.toString():
      console.log("here");
      return <SwaggerComponent url={url} />;

    case DocumentationVisualizer.REDOCLY.toString():
      console.log("here2");
      return <RedoclyComponent url={url} />;
  }
};

export default DocumentationViewerComponent;
