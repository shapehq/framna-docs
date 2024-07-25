export type GitHubLogin = {
  readonly name: string
  readonly avatarUrl: string
}

export default interface IGitHubLoginDataSource {
  getLogins(): Promise<GitHubLogin[]>
}
