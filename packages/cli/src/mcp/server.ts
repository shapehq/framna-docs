import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { OpenAPIService } from "../openapi/index.js"

const TOOLS = [
  {
    name: "list_projects",
    description: "List all available API documentation projects",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_project",
    description: "Get details about a specific project including versions and specs",
    inputSchema: {
      type: "object" as const,
      properties: {
        project: { type: "string", description: "Project (owner/name)" },
      },
      required: ["project"],
    },
  },
  {
    name: "list_endpoints",
    description: "List API endpoints for a project",
    inputSchema: {
      type: "object" as const,
      properties: {
        project: { type: "string", description: "Project (owner/name)" },
        version: { type: "string", description: "Version name (optional)" },
        spec: { type: "string", description: "Spec name (optional)" },
      },
      required: ["project"],
    },
  },
  {
    name: "search_endpoints",
    description: "Search for endpoints matching a query",
    inputSchema: {
      type: "object" as const,
      properties: {
        project: { type: "string", description: "Project (owner/name)" },
        query: { type: "string", description: "Search query" },
        version: { type: "string", description: "Version name (optional)" },
        spec: { type: "string", description: "Spec name (optional)" },
      },
      required: ["project", "query"],
    },
  },
  {
    name: "get_endpoint_details",
    description: "Get endpoint with full details including parameters, request/response bodies, and all referenced schemas",
    inputSchema: {
      type: "object" as const,
      properties: {
        project: { type: "string", description: "Project (owner/name)" },
        path: { type: "string", description: "Endpoint path" },
        method: { type: "string", description: "HTTP method" },
        version: { type: "string", description: "Version name (optional)" },
        spec: { type: "string", description: "Spec name (optional)" },
      },
      required: ["project", "path", "method"],
    },
  },
  {
    name: "list_schemas",
    description: "List API schemas for a project",
    inputSchema: {
      type: "object" as const,
      properties: {
        project: { type: "string", description: "Project (owner/name)" },
        version: { type: "string", description: "Version name (optional)" },
        spec: { type: "string", description: "Spec name (optional)" },
      },
      required: ["project"],
    },
  },
  {
    name: "get_schema",
    description: "Get a specific schema definition",
    inputSchema: {
      type: "object" as const,
      properties: {
        project: { type: "string", description: "Project (owner/name)" },
        name: { type: "string", description: "Schema name" },
        version: { type: "string", description: "Version name (optional)" },
        spec: { type: "string", description: "Spec name (optional)" },
      },
      required: ["project", "name"],
    },
  },
]

function parseProject(project: string): { owner: string; name: string } {
  if (!project.includes("/")) {
    throw new Error(`Invalid project format: ${project}. Use owner/name format.`)
  }
  const [owner, name] = project.split("/")
  return { owner, name }
}

export function createMCPServer(service: OpenAPIService): Server {
  const server = new Server(
    { name: "framna-docs", version: "0.1.0" },
    { capabilities: { tools: {} } }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    try {
      switch (name) {
        case "list_projects": {
          const projects = await service.listProjects()
          return {
            content: [{ type: "text", text: JSON.stringify({ projects }, null, 2) }],
          }
        }

        case "get_project": {
          const { project: projectId } = args as { project: string }
          const { owner, name } = parseProject(projectId)
          const project = await service.getProject(owner, name)
          return {
            content: [{ type: "text", text: JSON.stringify({ project }, null, 2) }],
          }
        }

        case "list_endpoints": {
          const params = args as { project: string; version?: string; spec?: string }
          const { owner, name } = parseProject(params.project)
          const project = await service.getProject(owner, name)
          const endpoints = await service.listEndpoints(project, params.version, params.spec)
          return {
            content: [{ type: "text", text: JSON.stringify({ endpoints }, null, 2) }],
          }
        }

        case "search_endpoints": {
          const params = args as { project: string; query: string; version?: string; spec?: string }
          const { owner, name } = parseProject(params.project)
          const project = await service.getProject(owner, name)
          const endpoints = await service.searchEndpoints(project, params.query, params.version, params.spec)
          return {
            content: [{ type: "text", text: JSON.stringify({ endpoints }, null, 2) }],
          }
        }

        case "get_endpoint_details": {
          const params = args as { project: string; path: string; method: string; version?: string; spec?: string }
          const { owner, name } = parseProject(params.project)
          const project = await service.getProject(owner, name)
          const endpoint = await service.getEndpointSlice(project, params.path, params.method, params.version, params.spec)
          return {
            content: [{ type: "text", text: JSON.stringify(endpoint, null, 2) }],
          }
        }

        case "list_schemas": {
          const params = args as { project: string; version?: string; spec?: string }
          const { owner, name } = parseProject(params.project)
          const project = await service.getProject(owner, name)
          const schemas = await service.listSchemas(project, params.version, params.spec)
          return {
            content: [{ type: "text", text: JSON.stringify({ schemas }, null, 2) }],
          }
        }

        case "get_schema": {
          const params = args as { project: string; name: string; version?: string; spec?: string }
          const { owner, name: projectName } = parseProject(params.project)
          const project = await service.getProject(owner, projectName)
          const schema = await service.getSchema(project, params.name, params.version, params.spec)
          return {
            content: [{ type: "text", text: JSON.stringify({ schema }, null, 2) }],
          }
        }

        default:
          return {
            content: [{ type: "text", text: `Unknown tool: ${name}` }],
            isError: true,
          }
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : "Unknown error",
          },
        ],
        isError: true,
      }
    }
  })

  return server
}

export async function runMCPServer(service: OpenAPIService): Promise<void> {
  const server = createMCPServer(service)
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
