"use client";

import { SelectChangeEvent, Select, MenuItem } from "@mui/material";
import { useState } from "react";
import { IOpenApiSpecification } from "../projects/IOpenAPISpecification";
import OpenApiSpecificationChangedEvent from "../events/OpenApiSpecificationChangedEvent";
import { publish } from "../utils/EventsUtils";
import { getProject, getSpecification, getVersion } from "../utils/UrlUtils";
import { useRouter } from "next/navigation";
import { useForceUpdate } from "../utils/Hooks";

interface OpenApiSpecificationSelectorComponentProps {
  openApiSpecifications: IOpenApiSpecification[];
  openAPISpecification?: string;
}

const OpenApiSpecificationSelectorComponent: React.FC<
  OpenApiSpecificationSelectorComponentProps
> = ({ openApiSpecifications, openAPISpecification }) => {
  const router = useRouter();

  const handleVersionChange = (event: SelectChangeEvent) => {
    const openApiSpecificationName = event.target.value;
    const openApiSpecification = openApiSpecifications.find(
      (x) => x.name === openApiSpecificationName
    );
    router.push(`/${getProject()?.replace("-openapi", "")}/${getVersion()}/${openApiSpecificationName}`);
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
