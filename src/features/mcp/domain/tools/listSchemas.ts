import { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js"
import { OpenAPIService } from "../OpenAPIService"
import { ListSchemasArgs } from "./types"

export async function listSchemas(
  openAPIService: OpenAPIService,
  args: ListSchemasArgs
): Promise<CallToolResult> {
  try {
    const schemas = await openAPIService.listSchemas(
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
        text: JSON.stringify({ schemas, count: schemas.length, metadata }, null, 2),
      } as TextContent],
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: String(error) }) } as TextContent],
      isError: true,
    }
  }
}
