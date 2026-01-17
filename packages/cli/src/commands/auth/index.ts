import { Command } from "commander"
import { createLoginCommand } from "./login.js"
import { createLogoutCommand } from "./logout.js"
import { createStatusCommand } from "./status.js"

export function createAuthCommand(): Command {
  const auth = new Command("auth").description("Authentication commands")

  auth.addCommand(createLoginCommand())
  auth.addCommand(createLogoutCommand())
  auth.addCommand(createStatusCommand())

  return auth
}
