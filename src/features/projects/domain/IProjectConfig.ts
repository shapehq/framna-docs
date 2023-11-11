export type ProjectConfigRemoteVersion = {
  readonly id?: string
  readonly name: string
  readonly specifications: ProjectConfigRemoteSpecification[]
}

export type ProjectConfigRemoteSpecification = {
  readonly name: string
  readonly url: string
}

export default interface IProjectConfig {
  readonly name?: string
  readonly image?: string
  readonly remoteVersions?: ProjectConfigRemoteVersion[]
}
