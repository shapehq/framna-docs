export default interface IGitHubLoginDataSource {
  getLogins(): Promise<string[]>
}
