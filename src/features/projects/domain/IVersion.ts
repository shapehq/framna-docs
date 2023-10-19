import IOpenApiSpecification from "./IOpenApiSpecification"

export default interface IVersion {
  readonly id: string
  readonly name: string
  readonly specifications: IOpenApiSpecification[]
}
