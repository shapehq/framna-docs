import { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js"
import { OpenAPIService } from "../OpenAPIService"
import { SearchEndpointsArgs } from "./types"

export async function searchEndpoints(
  openAPIService: OpenAPIService,
  args: SearchEndpointsArgs
): Promise<CallToolResult> {
  try {
    const results = await openAPIService.searchEndpoints(
      args.projectName,
      args.query,
      args.version,
      args.specName
    )
    const metadata = await openAPIService.getSpecMetadata(
      args.projectName,
      args.version,
      args.specName
    )

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          query: args.query,
          results,
          count: results.length,
          metadata
        }, null, 2),
      } as TextContent],
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: String(error) }) } as TextContent],
      isError: true,
    }
  }
}
