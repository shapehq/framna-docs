import IAzureDevOpsRepositoryDataSource, {
  AzureDevOpsRepositoryWithRefs,
  AzureDevOpsRepositoryRef
} from "../domain/IAzureDevOpsRepositoryDataSource"
import { IAzureDevOpsClient, AzureDevOpsRepository, AzureDevOpsRef } from "@/common/azure-devops"

export default class AzureDevOpsRepositoryDataSource implements IAzureDevOpsRepositoryDataSource {
  private readonly client: IAzureDevOpsClient
  private readonly organization: string
  private readonly repositoryNameSuffix: string
  private readonly projectConfigurationFilename: string

  constructor(config: {
    client: IAzureDevOpsClient
    organization: string
    repositoryNameSuffix: string
    projectConfigurationFilename: string
  }) {
    this.client = config.client
    this.organization = config.organization
    this.repositoryNameSuffix = config.repositoryNameSuffix
    this.projectConfigurationFilename = config.projectConfigurationFilename.replace(/\.ya?ml$/, "")
  }

  async getRepositories(): Promise<AzureDevOpsRepositoryWithRefs[]> {
    const allRepos = await this.client.getRepositories()

    // Filter repos by naming convention
    const matchingRepos = allRepos.filter(repo =>
      repo.name.endsWith(this.repositoryNameSuffix)
    )

    // Fetch details for each matching repo
    const results = await Promise.all(
      matchingRepos.map(repo => this.enrichRepository(repo))
    )

    return results.filter((repo): repo is AzureDevOpsRepositoryWithRefs => repo !== null)
  }

  private async enrichRepository(repo: AzureDevOpsRepository): Promise<AzureDevOpsRepositoryWithRefs | null> {
    try {
      const refs = await this.client.getRefs(repo.id)

      // Separate branches and tags
      const branchRefs = refs.filter(ref => ref.name.startsWith("refs/heads/"))
      const tagRefs = refs.filter(ref => ref.name.startsWith("refs/tags/"))

      // Get default branch name
      const defaultBranchName = repo.defaultBranch?.replace("refs/heads/", "") || "main"
      const defaultBranchRef = branchRefs.find(ref =>
        ref.name === `refs/heads/${defaultBranchName}`
      )

      // Fetch files for each branch/tag
      const branches = await Promise.all(
        branchRefs.map(ref => this.enrichRef(repo.id, ref))
      )
      const tags = await Promise.all(
        tagRefs.map(ref => this.enrichRef(repo.id, ref))
      )

      // Fetch config files from default branch
      const configYml = await this.fetchConfigFile(repo.id, defaultBranchName, ".yml")
      const configYaml = await this.fetchConfigFile(repo.id, defaultBranchName, ".yaml")

      return {
        name: repo.name,
        owner: this.organization,
        webUrl: repo.webUrl,
        defaultBranchRef: {
          id: defaultBranchRef?.objectId || "",
          name: defaultBranchName
        },
        configYml,
        configYaml,
        branches: branches.filter((b): b is AzureDevOpsRepositoryRef => b !== null),
        tags: tags.filter((t): t is AzureDevOpsRepositoryRef => t !== null)
      }
    } catch {
      return null
    }
  }

  private async enrichRef(
    repositoryId: string,
    ref: AzureDevOpsRef
  ): Promise<AzureDevOpsRepositoryRef | null> {
    try {
      // Extract branch/tag name from full ref path
      const name = ref.name
        .replace("refs/heads/", "")
        .replace("refs/tags/", "")

      // Get root files for this ref
      const items = await this.client.getItems(repositoryId, "/", name)
      const files = items
        .filter(item => item.gitObjectType === "blob")
        .map(item => ({ name: item.path.replace("/", "") }))

      return {
        id: ref.objectId,
        name,
        files
      }
    } catch {
      return null
    }
  }

  private async fetchConfigFile(
    repositoryId: string,
    branchName: string,
    extension: string
  ): Promise<{ text: string } | undefined> {
    const path = `${this.projectConfigurationFilename}${extension}`
    const content = await this.client.getFileContent(repositoryId, path, branchName)

    if (content && typeof content === "string") {
      return { text: content }
    }
    return undefined
  }
}
