import { parse } from 'yaml'
import IProjectConfig from "./IProjectConfig"

export default class ProjectConfigParser {
  parse(rawConfig: string): IProjectConfig {
    const obj = parse(rawConfig)
    if (obj !== null) {
      return obj
    } else {
      return {}
    }
  }
}
