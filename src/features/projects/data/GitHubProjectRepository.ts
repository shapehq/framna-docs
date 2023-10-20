import { Octokit } from "octokit"
import AccessTokenService from "@/features/auth/domain/AccessTokenService"
import IProject from "../domain/IProject"
import IProjectConfig from "../domain/IProjectConfig"
import IProjectRepository from "../domain/IProjectRepository"
import IVersion from "../domain/IVersion"
import IOpenApiSpecification from "../domain/IOpenApiSpecification"
import ProjectConfigParser from "../domain/ProjectConfigParser"
import IGitHubOrganizationNameProvider from "./IGitHubOrganizationNameProvider"

export default class GitHubProjectRepository implements IProjectRepository<IProject> {
  private organizationNameProvider: IGitHubOrganizationNameProvider
  private accessTokenService: AccessTokenService
  
  constructor(
    organizationNameProvider: IGitHubOrganizationNameProvider, 
    accessTokenService: AccessTokenService
  ) {
    this.organizationNameProvider = organizationNameProvider
    this.accessTokenService = accessTokenService
  }
  
  async getProjects(): Promise<IProject[]> {
    const organizationName = await this.organizationNameProvider.getOrganizationName()
    const accessToken = await this.accessTokenService.getAccessToken()
    const octokit = new Octokit({ auth: accessToken })
    const response: any = await octokit.graphql(`
      query Repositories($searchQuery: String!) {
        search(query: $searchQuery, type: REPOSITORY, first: 100) {
          results: nodes {
            ... on Repository {
              name
              owner {
                login
              }
              defaultBranchRef {
                name
              }
              configYml: object(expression: "HEAD:.shape-docs.yml") {
                ...ConfigParts
              }
              configYaml: object(expression: "HEAD:.shape-docs.yaml") {
                ...ConfigParts
              }
              branches: refs(refPrefix: "refs/heads/", first: 100) {
                ...RefConnectionParts
              }
              tags: refs(refPrefix: "refs/tags/", first: 100) {
                ...RefConnectionParts
              }
            }
          }
        }
      }
      
      fragment RefConnectionParts on RefConnection {
        nodes {
          name
          target {
            ... on Commit {
              tree {
                entries {
                  name
                }
              }
            }
          }
        }
      }
      
      fragment ConfigParts on GitObject {
        ... on Blob {
          text
        }
      }
      `,
      {
        searchQuery: `org:${organizationName} openapi in:name`
      }
    )
    return response.search.results.map((e: any) => {
      return this.mapProject(e)
    })
    .filter((e: IProject) => {
      return e.versions.length > 0
    })
    .sort((a: any, b: any) => {
      return a.name.localeCompare(b.name)
    })
  }
  
  private mapProject(searchResult: any): IProject {
    const config = this.getConfig(searchResult)
    let imageURL: string | undefined
    if (config && config.image) {
      imageURL = this.getGitHubBlobURL(
        searchResult.owner.login,
        searchResult.name,
        config.image,
        searchResult.defaultBranchRef.name
      )
    }
    return {
      id: searchResult.name.replace(/\-openapi$/, ""),
      name: searchResult.name,
      displayName: config?.name || searchResult.name,
      versions: this.getVersions(searchResult).filter(e => {
        return e.specifications.length > 0
      }),
      imageURL: imageURL
    }
  }
  
  private getConfig(searchResult: any): IProjectConfig | null {
    const rawConfig = searchResult.configYml.text || searchResult.configYaml.text
    if (!rawConfig || rawConfig.length == 0) {
      return null
    }
    const parser = new ProjectConfigParser()
    return parser.parse(rawConfig)
  }
  
  private getVersions(searchResult: any): IVersion[] {
    const branchVersions = searchResult.branches.nodes.map((ref: any) => {
      return this.mapVersionFromRef(searchResult.owner.login, searchResult.name, ref)
    })
    const tagVersions = searchResult.tags.nodes.map((ref: any) => {
      return this.mapVersionFromRef(searchResult.owner.login, searchResult.name, ref)
    })
    const defaultBranchName = searchResult.defaultBranchRef.name
    const candidateDefaultBranches = [
      defaultBranchName, "main", "master", "develop", "development"
    ]
    // Reverse them so the top-priority branches end up at the top of the list.
    .reverse()
    let allVersions = branchVersions.concat(tagVersions).sort((a: any, b: any) => {
      return a.name.localeCompare(b.name)
    })
    // Move the top-priority branches to the top of the list.
    for (const candidateDefaultBranch of candidateDefaultBranches) {
      const defaultBranchIndex = allVersions.findIndex((e: any) => {
        return e.name === candidateDefaultBranch
      })
      if (defaultBranchIndex !== -1) {
        const branchVersion = allVersions[defaultBranchIndex]
        allVersions.splice(defaultBranchIndex, 1)
        allVersions.splice(0, 0, branchVersion)
      }
    }
    return allVersions
  }
  
  private mapVersionFromRef(owner: string, repository: string, ref: any): IVersion {
    const specifications = ref.target.tree.entries.map((item: any) => {
      if (!this.isOpenAPISpecification(item.name)) {
        return null
      }
      return {
        id: item.name,
        name: item.name,
        url: this.getGitHubBlobURL(
          owner,
          repository,
          item.name,
          ref.name
        ),
        editURL: `https://github.com/${owner}/${repository}/edit/${ref.name}/${item.name}`
      }
    })
    .filter((e: IOpenApiSpecification | null) => {
      return e != null
    })
    return {
      id: ref.name,
      name: ref.name,
      specifications: specifications,
      url: `https://github.com/${owner}/${repository}/tree/${ref.name}`
    }
  }

  private isOpenAPISpecification(filename: string) {
    return !filename.startsWith(".") && (
      filename.endsWith(".yml") || filename.endsWith(".yaml")
    )
  }
  
  private getGitHubBlobURL(owner: string, repository: string, path: string, ref: string): string {
    return `/api/github/blob/${owner}/${repository}/${path}?ref=${ref}`
  }
}
