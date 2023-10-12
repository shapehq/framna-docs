import { SelectChangeEvent, Select, MenuItem } from "@mui/material";
import { useState } from "react";
import { DocumentationVisualizer } from "../DocumentationViewerComponent";
import { getSettings, setSettings } from "@/lib/utils/SettingsUtils";

const DocumentationViewerSelectorComponent: React.FC = () => {
  const [visualizer, setVisualizer] = useState(
    getSettings().documentationVisualizer
  );

  const handleChange = (event: SelectChangeEvent) => {
    const documentationVisualizer = parseInt(
      event.target.value
    ) as DocumentationVisualizer;
    setVisualizer(documentationVisualizer);
    setTimeout(() =>
      setSettings({
        ...getSettings(),
        documentationVisualizer,
      })
    );
  };

  return (
    <Select
      value={visualizer.toString()}
      label="Visualizer"
      onChange={handleChange}
    >
      <MenuItem value={DocumentationVisualizer.SWAGGER.toString()}>
        Swagger
      </MenuItem>
      <MenuItem value={DocumentationVisualizer.REDOCLY.toString()}>
        Redocly
      </MenuItem>
    </Select>
  );
};

export default DocumentationViewerSelectorComponent;
