export interface EndpointSummary {
  path: string
  method: string
  summary?: string
  operationId?: string
  tags?: string[]
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
