import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useState } from "react";
import { DocumentationVisualizer } from "../DocumentationViewerComponent";
import { getSettings, setSettings } from "@/lib/utils/SettingsUtils";
import Image from 'next/image'

const DocumentationViewerSelectorComponent: React.FC = () => {
  const [visualizer, setVisualizer] = useState(
    getSettings().documentationVisualizer
  );
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>, 
    documentationVisualizer: DocumentationVisualizer
  ) => {
    setVisualizer(documentationVisualizer);
    setTimeout(() =>
      setSettings({
        ...getSettings(),
        documentationVisualizer,
      })
    );
  };
  return (
    <ToggleButtonGroup
      exclusive
      value={visualizer.toString()}
      onChange={handleChange}
      fullWidth={true}
      color="secondary"
    >
      <ToggleButton value={DocumentationVisualizer.SWAGGER.toString()}>
        <Image src="/swagger.png" alt="Swagger" width={24} height={24} />
      </ToggleButton>
      <ToggleButton value={DocumentationVisualizer.REDOCLY.toString()}>
        <Image src="/redocly.png" alt="Redocly" width={24} height={24} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default DocumentationViewerSelectorComponent;
