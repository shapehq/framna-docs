import { Command } from "commander"
import chalk from "chalk"

export function createMcpCommand(): Command {
  return new Command("mcp")
    .description("Start MCP server for AI assistant integration")
    .action(async () => {
      console.log(chalk.dim("MCP server coming soon..."))
    })
}
