import { OpenAPIV3 } from "openapi-types"

export interface EndpointSummary {
  path: string
  method: string
  summary?: string
  operationId?: string
  tags?: string[]
}

export interface EndpointSlice {
  method: string
  path: string
  summary?: string
  description?: string
  operationId?: string
  tags?: string[]
  parameters?: OpenAPIV3.ParameterObject[]
  requestBody?: OpenAPIV3.RequestBodyObject
  responses: Record<string, OpenAPIV3.ResponseObject>
  schemas?: Record<string, OpenAPIV3.SchemaObject>
}

export interface ProjectSummary {
  id: string
  name: string
  displayName: string
  owner: string
  imageURL?: string
  url?: string
  ownerUrl: string
}

export interface OpenApiSpecification {
  id: string
  name: string
  url: string
  isDefault: boolean
}

export interface Version {
  id: string
  name: string
  specifications: OpenApiSpecification[]
  isDefault: boolean
}

export interface Project {
  id: string
  name: string
  displayName: string
  versions: Version[]
  owner: string
}
