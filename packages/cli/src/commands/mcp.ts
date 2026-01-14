import { Command } from "commander"
import chalk from "chalk"
import { getSession, getServerUrl } from "../config.js"
import { APIClient } from "../api.js"
import { runMCPServer } from "../mcp/server.js"

export function createMCPCommand(): Command {
  const mcp = new Command("mcp").description("MCP server commands")

  mcp
    .command("serve")
    .description("Start stdio MCP server for Claude integration")
    .action(async () => {
      const session = await getSession()

      if (!session) {
        console.error(chalk.red("Not authenticated"))
        console.error(chalk.dim("Run 'framna-docs auth login' to authenticate"))
        process.exit(1)
      }

      const client = new APIClient(getServerUrl(), session.sessionId)

      // Run MCP server - this blocks until the connection closes
      await runMCPServer(client)
    })

  return mcp
}
