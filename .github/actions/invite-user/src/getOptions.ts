import * as core from "@actions/core"
import { ActionOptions } from "./Action"

export default function getOptions(): ActionOptions {
  return {
    name: core.getInput("name"),
    email: core.getInput("email"),
    roles: core.getInput("roles")
  }
}
