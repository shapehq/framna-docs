export type GitHubLogin = {
  readonly name: string
}

export default interface IGitHubLoginDataSource {
  getLogins(): Promise<GitHubLogin[]>
}
