import { IGitHubClient, PullRequestFile } from "@/common"
import { getBaseFilename } from "@/common/utils"

export default class PullRequestCommenter {
  private readonly siteName: string
  private readonly repositoryNameSuffix: string
  private readonly projectConfigurationFilename: string
  private readonly gitHubAppId: string
  private readonly gitHubClient: IGitHubClient
  
  constructor(config: {
    siteName: string
    repositoryNameSuffix: string
    projectConfigurationFilename: string
    gitHubAppId: string
    gitHubClient: IGitHubClient
  }) {
    this.siteName = config.siteName
    this.repositoryNameSuffix = config.repositoryNameSuffix
    this.projectConfigurationFilename = config.projectConfigurationFilename
    this.gitHubAppId = config.gitHubAppId
    this.gitHubClient = config.gitHubClient
  }
  
  async commentPullRequest(request: {
    hostURL: string
    appInstallationId: number
    repositoryOwner: string
    repositoryName: string
    ref: string
    pullRequestNumber: number
  }) {
    const files = this.getChangedFiles(await this.getYamlFiles(request))
    const commentBody = this.makeCommentBody({
      files,
      hostURL: request.hostURL,
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
  
  private getChangedFiles(files: PullRequestFile[]) {
    return files
      .filter(file => file.status != "unchanged")
      .filter(file => {
        // Do not include files that begins with a dot (.) unless it's the project configuration.
        return !file.filename.startsWith(".") || this.isProjectConfigurationFile(file.filename)
      })
      .filter(file => {
        // Do not include files in folders.
        return file.filename.split("/").length === 1
      })
  }
  
  private async getYamlFiles(request: {
    appInstallationId: number
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
    return files.filter(file => file.filename.match(/\.ya?ml$/))
  }
  
  private async getExistingComment(request: {
    appInstallationId: number
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
    hostURL: string
    files: PullRequestFile[]
    owner: string
    repositoryName: string
    ref: string
  }): string {
    const { hostURL, owner, repositoryName, ref } = params
    const projectId = this.getProjectId({ repositoryName })
    const tableHTML = this.makeFileTableHTML(params)
    let result = "### 📖 Documentation Preview"
    result += "\n\n"
    result += `The changes are now ready to previewed on <a href="${hostURL}/${owner}/${projectId}/${ref}">${this.siteName}</a> 🚀`
    if (tableHTML) {
      result += "\n\n" + tableHTML
   }
    return result
  }
  
  private makeFileTableHTML(params: {
    hostURL: string
    files: PullRequestFile[]
    owner: string
    repositoryName: string
    ref: string
  }) {
    const { hostURL, files, owner, repositoryName, ref } = params
    const rows: { filename: string, status: string, button: string }[] = []
    const projectId = this.getProjectId({ repositoryName })
    // Create rows for each file
    for (const file of files) {
      const status = this.getStatusText(file)
      let button = ""
      if (file.status != "removed") {
        let link = `${hostURL}/${owner}/${projectId}/${ref}`
        if (!this.isProjectConfigurationFile(file.filename)) {
          link += `/${file.filename}`
        }
        button = ` <a href="${link}">Preview</a>`
      }
      rows.push({ filename: file.filename, status, button })
    }
    if (rows.length == 0) {
      return undefined
    }
    const rowsHTML = rows
      .map(row => `<tr><td><strong>${row.filename}</strong></td><td>${row.status}</td><td>${row.button}</td></tr>`)
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
  
  private isProjectConfigurationFile(filename: string) {
    return getBaseFilename(filename) === getBaseFilename(this.projectConfigurationFilename)
  }
}