import { parse as parseYaml } from "yaml"
import { ErrorName } from "./route"

export function checkIfJsonOrYaml(fileText: string) {
  try {
    parseYaml(fileText) // will also parse JSON as it is a subset of YAML
  } catch {
    const error = new Error("File is not JSON or YAML")
    error.name = ErrorName.NOT_JSON_OR_YAML
    throw error
  }
}
