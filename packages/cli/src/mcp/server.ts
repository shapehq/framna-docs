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
        name: { type: "string", description: "Project name" },
      },
      required: ["name"],
    },
  },
  {
    name: "list_endpoints",
    description: "List API endpoints for a project",
    inputSchema: {
      type: "object" as const,
      properties: {
        project: { type: "string", description: "Project name" },
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
        project: { type: "string", description: "Project name" },
        query: { type: "string", description: "Search query" },
        version: { type: "string", description: "Version name (optional)" },
        spec: { type: "string", description: "Spec name (optional)" },
      },
      required: ["project", "query"],
    },
  },
  {
    name: "get_endpoint_details",
    description: "Get detailed information about a specific endpoint",
    inputSchema: {
      type: "object" as const,
      properties: {
        project: { type: "string", description: "Project name" },
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
        project: { type: "string", description: "Project name" },
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
        project: { type: "string", description: "Project name" },
        name: { type: "string", description: "Schema name" },
        version: { type: "string", description: "Version name (optional)" },
        spec: { type: "string", description: "Spec name (optional)" },
      },
      required: ["project", "name"],
    },
  },
]

async function resolveProject(service: OpenAPIService, projectName: string) {
  const projects = await service.listProjects()
  const found = projects.find(p => p.name === projectName)
  if (!found) throw new Error(`Project not found: ${projectName}`)
  return service.getProject(found.owner, found.name)
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
          const { name: projectName } = args as { name: string }
          const project = await resolveProject(service, projectName)
          return {
            content: [{ type: "text", text: JSON.stringify({ project }, null, 2) }],
          }
        }

        case "list_endpoints": {
          const params = args as { project: string; version?: string; spec?: string }
          const project = await resolveProject(service, params.project)
          const endpoints = await service.listEndpoints(project, params.version, params.spec)
          return {
            content: [{ type: "text", text: JSON.stringify({ endpoints }, null, 2) }],
          }
        }

        case "search_endpoints": {
          const params = args as { project: string; query: string; version?: string; spec?: string }
          const project = await resolveProject(service, params.project)
          const endpoints = await service.searchEndpoints(project, params.query, params.version, params.spec)
          return {
            content: [{ type: "text", text: JSON.stringify({ endpoints }, null, 2) }],
          }
        }

        case "get_endpoint_details": {
          const params = args as { project: string; path: string; method: string; version?: string; spec?: string }
          const project = await resolveProject(service, params.project)
          const endpoint = await service.getEndpointDetails(project, params.path, params.method, params.version, params.spec)
          return {
            content: [{ type: "text", text: JSON.stringify({ endpoint }, null, 2) }],
          }
        }

        case "list_schemas": {
          const params = args as { project: string; version?: string; spec?: string }
          const project = await resolveProject(service, params.project)
          const schemas = await service.listSchemas(project, params.version, params.spec)
          return {
            content: [{ type: "text", text: JSON.stringify({ schemas }, null, 2) }],
          }
        }

        case "get_schema": {
          const params = args as { project: string; name: string; version?: string; spec?: string }
          const project = await resolveProject(service, params.project)
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
