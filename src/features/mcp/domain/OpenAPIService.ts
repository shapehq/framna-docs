import SwaggerParser from "@apidevtools/swagger-parser"
import { OpenAPIV3 } from "openapi-types"
import yaml from "yaml"
import IGitHubClient from "@/common/github/IGitHubClient"
import IProjectListDataSource from "@/features/projects/domain/IProjectListDataSource"
import IProjectDetailsDataSource from "@/features/projects/domain/IProjectDetailsDataSource"
import Project from "@/features/projects/domain/Project"
import Version from "@/features/projects/domain/Version"
import OpenApiSpecification from "@/features/projects/domain/OpenApiSpecification"
import { SpecCache } from "./SpecCache"

interface OpenAPIServiceConfig {
  gitHubClient: IGitHubClient
  projectListDataSource: IProjectListDataSource
  projectDetailsDataSource: IProjectDetailsDataSource
}

export interface EndpointSummary {
  path: string
  method: string
  summary?: string
  operationId?: string
  tags?: string[]
}

export interface SpecMetadata {
  specUsed: string
  versionUsed: string
  availableSpecs: string[]
  availableVersions: string[]
}

interface ParsedSpecUrl {
  owner: string
  repository: string
  path: string
  ref: string
}

// Module-level singleton cache persists across requests
const specCache = new SpecCache()

export class OpenAPIService {
  private gitHubClient: IGitHubClient
  private projectListDataSource: IProjectListDataSource
  private projectDetailsDataSource: IProjectDetailsDataSource

  constructor(config: OpenAPIServiceConfig) {
    this.gitHubClient = config.gitHubClient
    this.projectListDataSource = config.projectListDataSource
    this.projectDetailsDataSource = config.projectDetailsDataSource
  }

  async getProject(projectName: string): Promise<Project | null> {
    // First get the project list to find the owner
    const projects = await this.projectListDataSource.getProjectList()
    const summary = projects.find(p => p.name === projectName)
    if (!summary) return null

    // Then get full details
    return await this.projectDetailsDataSource.getProjectDetails(summary.owner, projectName)
  }

  async getSpec(
    projectName: string,
    versionName?: string,
    specName?: string
  ): Promise<OpenAPIV3.Document> {
    const project = await this.getProject(projectName)
    if (!project) throw new Error(`Project not found: ${projectName}`)

    const version = this.findVersion(project, versionName)
    if (!version) throw new Error(`Version not found: ${versionName || "default"}`)

    const spec = this.findSpec(version, specName)
    if (!spec) throw new Error(`Spec not found: ${specName || "default"}`)

    const cacheKey = SpecCache.createKey(projectName, version.name, spec.name)
    const cached = specCache.get(cacheKey)
    if (cached) return cached

    const parsed = this.parseSpecUrl(spec.url)
    if (!parsed) throw new Error(`Invalid spec URL: ${spec.url}`)

    const content = await this.gitHubClient.getRepositoryContent({
      repositoryOwner: parsed.owner,
      repositoryName: parsed.repository,
      path: parsed.path,
      ref: parsed.ref
    })

    // Fetch the actual content from the download URL
    const response = await fetch(content.downloadURL)
    const text = await response.text()

    const parsedYaml = yaml.parse(text)
    const dereferenced = await SwaggerParser.dereference(parsedYaml) as OpenAPIV3.Document

    specCache.set(cacheKey, dereferenced)
    return dereferenced
  }

  async listEndpoints(
    projectName: string,
    versionName?: string,
    specName?: string
  ): Promise<EndpointSummary[]> {
    const spec = await this.getSpec(projectName, versionName, specName)
    const endpoints: EndpointSummary[] = []
    const methods = ["get", "post", "put", "delete", "patch", "options", "head"] as const

    for (const [path, pathItem] of Object.entries(spec.paths || {})) {
      if (!pathItem) continue
      for (const method of methods) {
        const operation = pathItem[method] as OpenAPIV3.OperationObject | undefined
        if (operation) {
          endpoints.push({
            path,
            method: method.toUpperCase(),
            summary: operation.summary,
            operationId: operation.operationId,
            tags: operation.tags,
          })
        }
      }
    }

    return endpoints
  }

  async getEndpointDetails(
    projectName: string,
    path: string,
    method: string,
    versionName?: string,
    specName?: string
  ): Promise<OpenAPIV3.OperationObject | null> {
    const spec = await this.getSpec(projectName, versionName, specName)
    const pathItem = spec.paths?.[path]
    if (!pathItem) return null
    return (pathItem as Record<string, OpenAPIV3.OperationObject>)[method.toLowerCase()] || null
  }

  async listSchemas(
    projectName: string,
    versionName?: string,
    specName?: string
  ): Promise<string[]> {
    const spec = await this.getSpec(projectName, versionName, specName)
    return Object.keys(spec.components?.schemas || {})
  }

  async getSchema(
    projectName: string,
    schemaName: string,
    versionName?: string,
    specName?: string
  ): Promise<OpenAPIV3.SchemaObject | null> {
    const spec = await this.getSpec(projectName, versionName, specName)
    return spec.components?.schemas?.[schemaName] as OpenAPIV3.SchemaObject || null
  }

  async searchEndpoints(
    projectName: string,
    query: string,
    versionName?: string,
    specName?: string
  ): Promise<EndpointSummary[]> {
    const endpoints = await this.listEndpoints(projectName, versionName, specName)
    const lowerQuery = query.toLowerCase()

    return endpoints.filter(e =>
      e.path.toLowerCase().includes(lowerQuery) ||
      e.summary?.toLowerCase().includes(lowerQuery) ||
      e.operationId?.toLowerCase().includes(lowerQuery) ||
      e.tags?.some(t => t.toLowerCase().includes(lowerQuery))
    )
  }

  async getSpecMetadata(projectName: string, versionName?: string, specName?: string): Promise<SpecMetadata> {
    const project = await this.getProject(projectName)
    if (!project) throw new Error(`Project not found: ${projectName}`)

    const version = this.findVersion(project, versionName)
    const spec = version ? this.findSpec(version, specName) : null

    return {
      specUsed: spec?.name || "default",
      versionUsed: version?.name || "default",
      availableSpecs: version?.specifications.map(s => s.name) || [],
      availableVersions: project.versions.map(v => v.name),
    }
  }

  private findVersion(project: Project, versionName?: string): Version | undefined {
    if (!versionName) {
      return project.versions.find(v => v.isDefault) || project.versions[0]
    }
    return project.versions.find(v => v.name === versionName || v.id === versionName)
  }

  private findSpec(version: Version, specName?: string): OpenApiSpecification | undefined {
    if (!specName) {
      return version.specifications.find(s => s.isDefault) || version.specifications[0]
    }
    return version.specifications.find(s => s.name === specName || s.id === specName)
  }

  private parseSpecUrl(url: string): ParsedSpecUrl | null {
    const blobMatch = url.match(/^\/api\/blob\/([^/]+)\/([^/]+)\/(.+)\?ref=(.+)$/)
    if (blobMatch) {
      return {
        owner: blobMatch[1],
        repository: blobMatch[2],
        path: decodeURIComponent(blobMatch[3]),
        ref: blobMatch[4]
      }
    }
    return null
  }
}
