import { SelectChangeEvent, Select, MenuItem } from "@mui/material";
import { useContext, useState } from "react";
import { DocumentationVisualizer } from "../DocumentationViewerComponent";
import { SettingsContext } from "@/lib/pages/FrontPage";

const DocumentationViewerSelectorComponent: React.FC = () => {
  const context = useContext(SettingsContext);
  const [visualizer, setVisualizer] = useState(
    context.settings.documentationVisualizer
  );
  const handleChange = (event: SelectChangeEvent) => {
    const documentationVisualizer = parseInt(
      event.target.value
    ) as DocumentationVisualizer;
    setVisualizer(documentationVisualizer);
    setTimeout(
      () =>
        context.setSettings({
          ...context.settings,
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
