"use client";

import { SelectChangeEvent, Select, MenuItem } from "@mui/material";
import { IOpenApiSpecification } from "../projects/IOpenAPISpecification";
import { getProject, getVersion } from "../utils/UrlUtils";
import { useRouter } from "next/navigation";

interface OpenApiSpecificationSelectorComponentProps {
  openApiSpecifications: IOpenApiSpecification[];
  openAPISpecification?: string; 
  versionName: string;
  projectName: string;
}

const OpenApiSpecificationSelectorComponent: React.FC<
  OpenApiSpecificationSelectorComponentProps
> = ({ openApiSpecifications, openAPISpecification, projectName, versionName }) => {
  const router = useRouter();
  const firstOpenAPISpecification = openApiSpecifications[0];
  if (
    (!openAPISpecification || openAPISpecification.length == 0) &&
    firstOpenAPISpecification
  ) {
    router.push(
      `/${projectName.replace("-openapi", "")}/${versionName}/${firstOpenAPISpecification.name}`
    );
  }

  const handleVersionChange = (event: SelectChangeEvent) => {
    const openApiSpecificationName = event.target.value;
    router.push(`/${getProject()?.replace("-openapi", "")}/${getVersion()}/${openApiSpecificationName}`);
  };

  return (
    <Select
      value={openAPISpecification}
      label="Open API Specification"
      onChange={handleVersionChange}
      sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 } }}
      autoWidth
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
