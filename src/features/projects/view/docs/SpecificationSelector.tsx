"use client"

import { useRouter } from "next/navigation"
import { SelectChangeEvent, Select, MenuItem } from "@mui/material"
import IOpenApiSpecification from "../../domain/IOpenApiSpecification"

interface SpecificationSelectorProps {
  specifications: IOpenApiSpecification[]
  selectedProjectId: string
  selectedVersionId: string
  selectedSpecificationId?: string
}

const SpecificationSelector: React.FC<
  SpecificationSelectorProps
> = ({
  specifications,
  selectedProjectId,
  selectedVersionId,
  selectedSpecificationId
}) => {
  const router = useRouter()
  const handleVersionChange = (event: SelectChangeEvent) => {
    const specificationId = event.target.value
    router.push(`/${selectedProjectId}/${selectedVersionId}/${specificationId}`)
  }
  return (
    <Select
      value={selectedSpecificationId}
      label="Open API Specification"
      onChange={handleVersionChange}
      sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 } }}
      autoWidth
    >
      {specifications.map(specification => {
        return (
          <MenuItem key={specification.id} value={specification.id}>
            {specification.name}
          </MenuItem>
        )
      })}
    </Select>
  )
}

export default SpecificationSelector
