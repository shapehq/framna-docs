import { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js"
import { OpenAPIService } from "../OpenAPIService"
import { ListEndpointsArgs } from "./types"

export async function listEndpoints(
  openAPIService: OpenAPIService,
  args: ListEndpointsArgs
): Promise<CallToolResult> {
  try {
    const endpoints = await openAPIService.listEndpoints(
      args.projectName,
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
        text: JSON.stringify({ endpoints, metadata }, null, 2),
      } as TextContent],
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: String(error) }) } as TextContent],
      isError: true,
    }
  }
}
