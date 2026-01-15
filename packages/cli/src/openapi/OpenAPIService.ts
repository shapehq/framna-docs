import SwaggerParser from "@apidevtools/swagger-parser"
import { OpenAPIV3 } from "openapi-types"
import yaml from "yaml"
import { APIClient } from "../api.js"
import { SpecCache, ProjectsCache, ProjectDetailsCache } from "../cache/index.js"
import { Project, ProjectSummary, Version, OpenApiSpecification, EndpointSummary, EndpointSlice } from "../types.js"

export class OpenAPIService {
  private client: APIClient
  private specCache: SpecCache
  private projectsCache: ProjectsCache
  private projectDetailsCache: ProjectDetailsCache

  constructor(client: APIClient, sessionToken: string) {
    this.client = client
    this.specCache = new SpecCache()
    this.projectsCache = new ProjectsCache(sessionToken)
    this.projectDetailsCache = new ProjectDetailsCache()
  }

  async listProjects(): Promise<ProjectSummary[]> {
    const cached = await this.projectsCache.getProjects()
    if (cached) return cached
    const { projects } = await this.client.get<{ projects: ProjectSummary[] }>("/api/cli/projects")
    await this.projectsCache.setProjects(projects)
    return projects
  }

  async getProject(owner: string, name: string): Promise<Project> {
    const cached = await this.projectDetailsCache.getProject(owner, name)
    if (cached) return cached
    const { project } = await this.client.get<{ project: Project }>(`/api/cli/projects/${owner}/${name}`)
    await this.projectDetailsCache.setProject(owner, name, project)
    return project
  }

  async getSpec(project: Project, versionName?: string, specName?: string): Promise<OpenAPIV3.Document> {
    const version = this.findVersion(project, versionName)
    if (!version) throw new Error(`Version not found: ${versionName || "default"}`)
    const spec = this.findSpec(version, specName)
    if (!spec) throw new Error(`Spec not found: ${specName || "default"}`)

    const ref = this.extractRef(spec.url)
    if (!ref) throw new Error(`Invalid spec URL: ${spec.url}`)

    const cached = await this.specCache.getSpec(ref)
    if (cached) return cached

    const raw = await this.client.getRaw(spec.url)
    const parsed = yaml.parse(raw)
    const dereferenced = await SwaggerParser.dereference(parsed) as OpenAPIV3.Document
    await this.specCache.setSpec(ref, dereferenced)
    return dereferenced
  }

  async listEndpoints(project: Project, versionName?: string, specName?: string): Promise<EndpointSummary[]> {
    const spec = await this.getSpec(project, versionName, specName)
    const endpoints: EndpointSummary[] = []
    const methods = ["get", "post", "put", "delete", "patch", "options", "head"] as const
    for (const [path, pathItem] of Object.entries(spec.paths || {})) {
      if (!pathItem) continue
      for (const method of methods) {
        const op = (pathItem as Record<string, OpenAPIV3.OperationObject>)[method]
        if (op) {
          endpoints.push({ path, method: method.toUpperCase(), summary: op.summary, operationId: op.operationId, tags: op.tags })
        }
      }
    }
    return endpoints
  }

  async getEndpointDetails(project: Project, path: string, method: string, versionName?: string, specName?: string): Promise<OpenAPIV3.OperationObject | null> {
    const spec = await this.getSpec(project, versionName, specName)
    const pathItem = spec.paths?.[path]
    if (!pathItem) return null
    return (pathItem as Record<string, OpenAPIV3.OperationObject>)[method.toLowerCase()] || null
  }

  async searchEndpoints(project: Project, query: string, versionName?: string, specName?: string): Promise<EndpointSummary[]> {
    const endpoints = await this.listEndpoints(project, versionName, specName)
    const q = query.toLowerCase()
    return endpoints.filter(e =>
      e.path.toLowerCase().includes(q) ||
      e.summary?.toLowerCase().includes(q) ||
      e.operationId?.toLowerCase().includes(q) ||
      e.tags?.some(t => t.toLowerCase().includes(q))
    )
  }

  async listSchemas(project: Project, versionName?: string, specName?: string): Promise<string[]> {
    const spec = await this.getSpec(project, versionName, specName)
    return Object.keys(spec.components?.schemas || {})
  }

  async getSchema(project: Project, schemaName: string, versionName?: string, specName?: string): Promise<OpenAPIV3.SchemaObject | null> {
    const spec = await this.getSpec(project, versionName, specName)
    return spec.components?.schemas?.[schemaName] as OpenAPIV3.SchemaObject || null
  }

  async getEndpointSlice(
    project: Project,
    path: string,
    method: string,
    versionName?: string,
    specName?: string
  ): Promise<EndpointSlice | null> {
    const spec = await this.getSpec(project, versionName, specName)
    const pathItem = spec.paths?.[path]
    if (!pathItem) return null

    const operation = (pathItem as Record<string, OpenAPIV3.OperationObject>)[method.toLowerCase()]
    if (!operation) return null

    // Collect schemas from the operation
    const schemas: Record<string, OpenAPIV3.SchemaObject> = {}
    const collectSchema = (obj: unknown, name?: string) => {
      if (!obj || typeof obj !== "object") return
      const schemaObj = obj as OpenAPIV3.SchemaObject

      // If it has a title, use that as the schema name
      if (schemaObj.title && !schemas[schemaObj.title]) {
        schemas[schemaObj.title] = schemaObj
      } else if (name && !schemas[name]) {
        schemas[name] = schemaObj
      }

      // Recurse into properties
      if (schemaObj.properties) {
        for (const [propName, prop] of Object.entries(schemaObj.properties)) {
          collectSchema(prop, propName)
        }
      }
      // Recurse into items (arrays)
      if ("items" in schemaObj && schemaObj.items) {
        collectSchema(schemaObj.items)
      }
      // Recurse into allOf/oneOf/anyOf
      for (const key of ["allOf", "oneOf", "anyOf"] as const) {
        if (schemaObj[key]) {
          for (const item of schemaObj[key] as OpenAPIV3.SchemaObject[]) {
            collectSchema(item)
          }
        }
      }
    }

    // Collect from request body
    if (operation.requestBody) {
      const reqBody = operation.requestBody as OpenAPIV3.RequestBodyObject
      for (const [, mediaType] of Object.entries(reqBody.content || {})) {
        if (mediaType.schema) {
          collectSchema(mediaType.schema, "RequestBody")
        }
      }
    }

    // Collect from responses
    for (const [statusCode, response] of Object.entries(operation.responses || {})) {
      const resp = response as OpenAPIV3.ResponseObject
      for (const [, mediaType] of Object.entries(resp.content || {})) {
        if (mediaType.schema) {
          collectSchema(mediaType.schema, `Response${statusCode}`)
        }
      }
    }

    // Collect from parameters
    for (const param of (operation.parameters || []) as OpenAPIV3.ParameterObject[]) {
      if (param.schema) {
        collectSchema(param.schema, param.name)
      }
    }

    return {
      method: method.toUpperCase(),
      path,
      summary: operation.summary,
      description: operation.description,
      operationId: operation.operationId,
      tags: operation.tags,
      parameters: operation.parameters as OpenAPIV3.ParameterObject[],
      requestBody: operation.requestBody as OpenAPIV3.RequestBodyObject | undefined,
      responses: operation.responses as Record<string, OpenAPIV3.ResponseObject>,
      schemas: Object.keys(schemas).length > 0 ? schemas : undefined,
    }
  }

  private findVersion(project: Project, name?: string): Version | undefined {
    if (!name) return project.versions.find(v => v.isDefault) || project.versions[0]
    return project.versions.find(v => v.name === name)
  }

  private findSpec(version: Version, name?: string): OpenApiSpecification | undefined {
    if (!name) return version.specifications.find(s => s.isDefault) || version.specifications[0]
    return version.specifications.find(s => s.name === name)
  }

  private extractRef(url: string): string | null {
    const match = url.match(/\?ref=(.+)$/)
    return match ? match[1] : null
  }
}
