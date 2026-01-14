export interface EndpointSummary {
  path: string
  method: string
  summary?: string
  operationId?: string
  tags?: string[]
}

export interface Project {
  id: string
  name: string
  displayName: string
  versions: Array<{
    name: string
    isDefault: boolean
    specifications: Array<{ name: string; isDefault: boolean }>
  }>
  owner: string
}
