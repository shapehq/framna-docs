import SwaggerParser from "@apidevtools/swagger-parser"
import { OpenAPIV3 } from "openapi-types"
import yaml from "yaml"
import { APIClient } from "../api.js"
import { SpecCache, ProjectsCache, ProjectDetailsCache } from "../cache/index.js"
import { Project, ProjectSummary, Version, OpenApiSpecification, EndpointSummary } from "../types.js"

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
