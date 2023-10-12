"use client";

import { SelectChangeEvent, Select, MenuItem } from "@mui/material";
import { useState } from "react";
import { IOpenApiSpecification } from "../projects/IOpenApiSpecification";
import OpenApiSpecificationChangedEvent from "../events/OpenApiSpecificationChangedEvent";
import { publish } from "../utils/EventsUtils";

interface OpenApiSpecificationSelectorComponentProps {
  openApiSpecifications: IOpenApiSpecification[];
}

const OpenApiSpecificationSelectorComponent: React.FC<
  OpenApiSpecificationSelectorComponentProps
> = ({ openApiSpecifications }) => {
  const [openAPISpecification, setOpenAPISpecification] = useState(
    openApiSpecifications[0].name
  );

  const handleVersionChange = (event: SelectChangeEvent) => {
    const openApiSpecificationName = event.target.value;
    setOpenAPISpecification(openApiSpecificationName);
    publish(
      new OpenApiSpecificationChangedEvent(
        openApiSpecifications.find(
          (x) => x.name == openApiSpecificationName
        ) as IOpenApiSpecification
      )
    );
  };

  return (
    <Select
      value={openAPISpecification}
      label="Open API Specification"
      onChange={handleVersionChange}
    >
      {openApiSpecifications.map((openApiSpecification, index) => {
        return (
          <MenuItem
            key={`OpenApiSpecification-${index}`}
            value={openApiSpecification.name}
          >
            {openApiSpecification.name}
          </MenuItem>
        );
      })}
    </Select>
  );
};

export default OpenApiSpecificationSelectorComponent;
