import { parse } from "yaml"
import IProjectConfig, { IProjectConfigSchema } from "./IProjectConfig"

export default class ProjectConfigParser {
  parse(rawConfig: string): IProjectConfig {
    const obj = parse(rawConfig)
    if (obj === null) {
      return {}
    }
    return IProjectConfigSchema.parse(obj)
  }
}
