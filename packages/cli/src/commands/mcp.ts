import { Command } from "commander"
import { getAuthenticatedClient } from "./shared.js"
import { runMCPServer } from "../mcp/server.js"

export function createMCPCommand(): Command {
  const mcp = new Command("mcp").description("MCP server commands")

  mcp
    .command("serve")
    .description("Start stdio MCP server for Claude integration")
    .action(async () => {
      const client = await getAuthenticatedClient()

      // Run MCP server - this blocks until the connection closes
      await runMCPServer(client)
    })

  return mcp
}
