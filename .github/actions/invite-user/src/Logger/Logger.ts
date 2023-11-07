import * as core from "@actions/core"
import ILogger from "./ILogger"

export default class Logger implements ILogger {
  log(message: string) {
    console.log(message)
  }
  
  error(message: string) {
    core.setFailed(message)
  }
}
