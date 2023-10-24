import ProjectPageSelection from "./ProjectPageSelection"

export default function updateWindowTitle(
  storage: { title: string },
  defaultTitle: string,
  selection?: ProjectPageSelection
) {
  if (!selection) {
    storage.title = defaultTitle
    return
  }
  if (!isSpecificationNameGeneric(selection.specification.name)) {
    storage.title = `${selection.project.displayName} / ${selection.version.name} / ${selection.specification.name}`
  } else if (!selection.version.isDefault) {
    storage.title = `${selection.project.displayName} / ${selection.version.name}`
  } else {
    storage.title = selection.project.displayName
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
