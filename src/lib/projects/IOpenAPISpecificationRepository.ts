import { IOpenApiSpecification } from "./IOpenAPISpecification"
import { IVersion } from "./IVersion"

export interface IOpenApiSpecificationRepository {
  getOpenAPISpecifications(version: IVersion): Promise<IOpenApiSpecification[]>
}
