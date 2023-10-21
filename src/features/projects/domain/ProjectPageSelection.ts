import IProject from "../domain/IProject"
import IVersion from "../domain/IVersion"
import IOpenApiSpecification from "../domain/IOpenApiSpecification"

type ProjectPageSelection = {
  readonly project: IProject
  readonly version: IVersion
  readonly specification: IOpenApiSpecification
}

export default ProjectPageSelection
