import { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js"
import { OpenAPIService } from "../OpenAPIService"
import { GetEndpointDetailsArgs } from "./types"

export async function getEndpointDetails(
  openAPIService: OpenAPIService,
  args: GetEndpointDetailsArgs
): Promise<CallToolResult> {
  try {
    const details = await openAPIService.getEndpointDetails(
      args.projectName,
      args.path,
      args.method,
      args.version,
      args.specName
    )
    const metadata = await openAPIService.getSpecMetadata(
      args.projectName,
      args.version,
      args.specName
    )

    if (!details) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: `Endpoint not found: ${args.method} ${args.path}`, metadata }),
        } as TextContent],
        isError: true,
      }
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ endpoint: { path: args.path, method: args.method, ...details }, metadata }, null, 2),
      } as TextContent],
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: String(error) }) } as TextContent],
      isError: true,
    }
  }
}
