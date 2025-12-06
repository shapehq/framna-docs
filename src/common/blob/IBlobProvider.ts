export default interface IBlobProvider {
  getFileContent(owner: string, repository: string, path: string, ref: string): Promise<string | Blob | null>
}
