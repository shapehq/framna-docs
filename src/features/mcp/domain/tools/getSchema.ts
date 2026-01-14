import { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js"
import { OpenAPIService } from "../OpenAPIService"
import { GetSchemaArgs } from "./types"

export async function getSchema(
  openAPIService: OpenAPIService,
  args: GetSchemaArgs
): Promise<CallToolResult> {
  try {
    const schema = await openAPIService.getSchema(
      args.projectName,
      args.schemaName,
      args.version,
      args.specName
    )
    const metadata = await openAPIService.getSpecMetadata(
      args.projectName,
      args.version,
      args.specName
    )

    if (!schema) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: `Schema not found: ${args.schemaName}`, metadata }),
        } as TextContent],
        isError: true,
      }
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ schemaName: args.schemaName, schema, metadata }, null, 2),
      } as TextContent],
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: String(error) }) } as TextContent],
      isError: true,
    }
  }
}
