import { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js"
import IProjectDataSource from "@/features/projects/domain/IProjectDataSource"

export async function listProjects(
  projectDataSource: IProjectDataSource
): Promise<CallToolResult> {
  try {
    const projects = await projectDataSource.getProjects()

    const result = {
      projects: projects.map(p => ({
        name: p.name,
        displayName: p.displayName,
        owner: p.owner,
        versions: p.versions.map(v => ({
          name: v.name,
          isDefault: v.isDefault,
          specs: v.specifications.map(s => s.name)
        })),
      })),
      count: projects.length,
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) } as TextContent],
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: String(error) }) } as TextContent],
      isError: true,
    }
  }
}
