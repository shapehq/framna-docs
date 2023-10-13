import { IOpenApiSpecification } from "./IOpenApiSpecification"
import { IVersion } from "./IVersion"

export interface IOpenApiSpecificationRepository {
  getOpenAPISpecifications(version: IVersion): Promise<IOpenApiSpecification[]>
}
