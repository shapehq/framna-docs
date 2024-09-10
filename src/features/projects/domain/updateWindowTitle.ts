import Project from "./Project"
import Version from "./Version"
import OpenApiSpecification from "./OpenApiSpecification"

export default function updateWindowTitle({
  storage,
  project,
  version,
  specification,
}: {
  storage: { title: string },
  project: Project,
  version?: Version,
  specification?: OpenApiSpecification
}) {
  if (version && specification && !isSpecificationNameGeneric(specification.name)) {
    storage.title = `${project.displayName} / ${version.name} / ${specification.name}`
  } else if (version && !version.isDefault) {
    storage.title = `${project.displayName} / ${version.name}`
  } else {
    storage.title = project.displayName
  }
}

function isSpecificationNameGeneric(name: string): boolean {
  const comps = name.split(".")
  if (comps.length > 1) {
    comps.pop()
    name = comps.join(".")
  }
  name = name.replace(/[^0-9a-zA-Z]/g, "")
  return [
    "api",
    "apispec",
    "apispecification",
    "openapi",
    "openapispec",
    "openapispecification",
    "spec",
    "specification",
    "swagger"
  ].includes(name)
}
