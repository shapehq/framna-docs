import { parse } from 'yaml'
import { IProjectConfig } from "./IProjectConfig"

export class ProjectConfigParser {
  parse(rawConfig: string): IProjectConfig {
    const obj = parse(rawConfig)
    if (obj !== null) {
      return obj
    } else {
      return {}
    }
  }
}
