import { Command } from "commander"
import chalk from "chalk"
import { getSession } from "../../config.js"

export function createStatusCommand(): Command {
  return new Command("status")
    .description("Check authentication status")
    .action(async () => {
      const session = await getSession()

      if (!session) {
        console.log(chalk.yellow("Not authenticated"))
        console.log(chalk.dim("Run 'framna-docs auth login' to authenticate"))
        return
      }

      console.log(chalk.green("Authenticated"))
      console.log(chalk.dim(`Session created: ${session.createdAt}`))
    })
}
