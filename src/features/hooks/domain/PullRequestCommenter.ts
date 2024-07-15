import { IGitHubClient, PullRequestFile } from "@/common"

export default class PullRequestCommenter {
  private readonly domain: string
  private readonly siteName: string
  private readonly repositoryNameSuffix: string
  private readonly projectConfigurationFilename: string
  private readonly gitHubAppId: string
  private readonly gitHubClient: IGitHubClient
  private readonly fileExtensionRegex = /\.ya?ml$/
  
  constructor(config: {
    domain: string
    siteName: string
    repositoryNameSuffix: string
    projectConfigurationFilename: string
    gitHubAppId: string
    gitHubClient: IGitHubClient
  }) {
    this.domain = config.domain
    this.siteName = config.siteName
    this.repositoryNameSuffix = config.repositoryNameSuffix
    this.projectConfigurationFilename = config.projectConfigurationFilename
    this.gitHubAppId = config.gitHubAppId
    this.gitHubClient = config.gitHubClient
  }
  
  async commentPullRequest(request: {
    appInstallationId: number
    repositoryOwner: string
    repositoryName: string
    ref: string
    pullRequestNumber: number
  }) {
    const files = await this.getChangedYamlFiles(request)
    const commentBody = this.makeCommentBody({
      files,
      owner: request.repositoryOwner,
      repositoryName: request.repositoryName,
      ref: request.ref
    })
    const existingComment = await this.getExistingComment(request)
    if (existingComment && existingComment.body !== commentBody) {
      await this.gitHubClient.updatePullRequestComment({
        appInstallationId: request.appInstallationId,
        commentId: existingComment.id,
        repositoryOwner: request.repositoryOwner,
        repositoryName: request.repositoryName,
        body: commentBody
      })
    } else if (!existingComment && files.length > 0) {
      await this.gitHubClient.addCommentToPullRequest({
        appInstallationId: request.appInstallationId,
        repositoryOwner: request.repositoryOwner,
        repositoryName: request.repositoryName,
        pullRequestNumber: request.pullRequestNumber,
        body: commentBody
      })
    }
  }
  
  private async getChangedYamlFiles(request: {
    appInstallationId: number,
    repositoryOwner: string
    repositoryName: string
    pullRequestNumber: number
  }) {
    const files = await this.gitHubClient.getPullRequestFiles({
      appInstallationId: request.appInstallationId,
      repositoryOwner: request.repositoryOwner,
      repositoryName: request.repositoryName,
      pullRequestNumber: request.pullRequestNumber
    })
    return files
      .filter(file => file.filename.match(this.fileExtensionRegex))
      .filter(file => file.status != "unchanged")
  }
  
  private async getExistingComment(request: {
    appInstallationId: number,
    repositoryOwner: string
    repositoryName: string
    pullRequestNumber: number
  }) {
    const comments = await this.gitHubClient.getPullRequestComments({
      appInstallationId: request.appInstallationId,
      repositoryOwner: request.repositoryOwner,
      repositoryName: request.repositoryName,
      pullRequestNumber: request.pullRequestNumber,
    })
    return comments.find(comment => {
      return comment.isFromBot && comment.gitHubApp?.id == this.gitHubAppId
    })
  }
  
  private makeCommentBody(params: {
    files: PullRequestFile[]
    owner: string
    repositoryName: string
    ref: string
  }): string {
    const { owner, repositoryName, ref } = params
    const projectId = this.getProjectId({ repositoryName })
    const tableHTML = this.makeFileTableHTML(params)
    let result = "### 📖 Documentation Preview"
    result += "\n\n"
    result += `The changes are now ready to previewed on <a href="${this.domain}/${owner}/${projectId}/${ref}">${this.siteName}</a> 🚀`
    if (tableHTML) {
      result += "\n\n" + tableHTML
   }
    return result
  }
  
  private makeFileTableHTML(params: {
    files: PullRequestFile[]
    owner: string
    repositoryName: string
    ref: string
  }) {
    const { files, owner, repositoryName, ref } = params
    const rows: { filename: string, link: string, status: string }[] = []
    const projectId = this.getProjectId({ repositoryName })
    // Make sure we don't include the project configuration file.
    const baseConfigFilename = this.projectConfigurationFilename.replace(this.fileExtensionRegex, "")
    const changedFiles = files.filter(file => file.filename.replace(this.fileExtensionRegex, "") != baseConfigFilename)
    // Create rows for each file
    for (const file of changedFiles) {
      const status = this.getStatusText(file)
      let link = ""
      if (file.status != "removed") {
        const url = `${this.domain}/${owner}/${projectId}/${ref}/${file.filename}`
        link += ` <a href="${url}">${url}</a>`
      }
      rows.push({ filename: file.filename, status, link })
    }
    if (rows.length == 0) {
      return undefined
    }
    const rowsHTML = rows
      .map(row => `<tr><td><strong>${row.filename}</strong></td><td>${row.link}</td><td>${row.status}</td></tr>`)
      .join("\n")
    return `<table>${rowsHTML}</table>`
  }
  
  private getStatusText(file: PullRequestFile) {
    if (file.status == "added") {
      return "Added"
    } else if (file.status == "removed") {
      return "Removed"
    } else if (file.status == "renamed") {
      return "Renamed"
    } else if (file.status == "changed" || file.status == "modified") {
      return "Changed"
    } else {
      return ""
    }
  }
  
  private getProjectId({ repositoryName }: { repositoryName: string }): string {
    return repositoryName.replace(new RegExp(this.repositoryNameSuffix + "$"), "")
  }
}
