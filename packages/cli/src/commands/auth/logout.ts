import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import { APIClient } from "../../api.js"
import { getSession, deleteSession, getServerUrl } from "../../config.js"

export function createLogoutCommand(): Command {
  return new Command("logout")
    .description("Log out from Framna Docs")
    .action(async () => {
      const spinner = ora()

      try {
        const session = await getSession()

        if (!session) {
          console.log(chalk.yellow("You are not logged in."))
          return
        }

        spinner.start("Logging out...")

        const serverUrl = getServerUrl()
        const client = new APIClient(serverUrl, session.sessionId)

        try {
          await client.post("/api/cli/auth/logout")
        } catch {
          // Ignore server errors - still delete local session
        }

        await deleteSession()
        spinner.succeed("Logged out successfully")
      } catch (error) {
        spinner.fail("Logout failed")
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
      }
    })
}
