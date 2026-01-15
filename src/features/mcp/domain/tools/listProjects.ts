import { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js"
import IProjectListDataSource from "@/features/projects/domain/IProjectListDataSource"
import IProjectDetailsDataSource from "@/features/projects/domain/IProjectDetailsDataSource"

export async function listProjects(
  projectListDataSource: IProjectListDataSource,
  projectDetailsDataSource: IProjectDetailsDataSource
): Promise<CallToolResult> {
  try {
    // First get the list of project summaries
    const summaries = await projectListDataSource.getProjectList()

    // Then fetch full details for each project
    const projects = await Promise.all(
      summaries.map(summary =>
        projectDetailsDataSource.getProjectDetails(summary.owner, summary.name)
      )
    )

    const result = {
      projects: projects.filter(Boolean).map(p => ({
        name: p!.name,
        displayName: p!.displayName,
        owner: p!.owner,
        versions: p!.versions.map(v => ({
          name: v.name,
          isDefault: v.isDefault,
          specs: v.specifications.map(s => s.name)
        })),
      })),
      count: projects.filter(Boolean).length,
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
