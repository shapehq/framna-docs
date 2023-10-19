import IVersion from "./IVersion"

export default interface IProject {
  readonly id: string
  readonly name: string
  readonly versions: IVersion[]
  readonly imageURL?: string
}
