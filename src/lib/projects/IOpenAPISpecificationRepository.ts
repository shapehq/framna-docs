import { IVersion } from "./IVersion"
import { IOpenAPISpecification } from "./IOpenAPISpecification"

export interface IOpenAPISpecificationRepository {
  getOpenAPISpecifications(version: IVersion): Promise<IOpenAPISpecification[]>
}
