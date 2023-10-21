import IVersion from "./IVersion"

export default interface IProject {
  readonly id: string
  readonly name: string
  readonly displayName?: string
  readonly versions: IVersion[]
  readonly imageURL?: string
}
