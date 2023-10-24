import Project from "../domain/Project"
import Version from "../domain/Version"
import OpenApiSpecification from "../domain/OpenApiSpecification"

type ProjectPageSelection = {
  readonly project: Project
  readonly version: Version
  readonly specification: OpenApiSpecification
}

export default ProjectPageSelection
