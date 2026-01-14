import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { APIClient } from "../api.js"
import { Project, EndpointSummary } from "../types.js"

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

export function createMCPServer(client: APIClient): Server {
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
          const result = await client.get<{ projects: Project[] }>(
            "/api/cli/projects"
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          }
        }

        case "get_project": {
          const projectName = (args as { name: string }).name
          const result = await client.get<{ project: Project }>(
            `/api/cli/projects/${projectName}`
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          }
        }

        case "list_endpoints": {
          const params = args as {
            project: string
            version?: string
            spec?: string
          }
          const queryParams: Record<string, string> = {
            project: params.project,
          }
          if (params.version) queryParams.version = params.version
          if (params.spec) queryParams.spec = params.spec

          const result = await client.get<{ endpoints: EndpointSummary[] }>(
            "/api/cli/endpoints",
            queryParams
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          }
        }

        case "search_endpoints": {
          const params = args as {
            project: string
            query: string
            version?: string
            spec?: string
          }
          const queryParams: Record<string, string> = {
            project: params.project,
            query: params.query,
          }
          if (params.version) queryParams.version = params.version
          if (params.spec) queryParams.spec = params.spec

          const result = await client.get<{ endpoints: EndpointSummary[] }>(
            "/api/cli/endpoints/search",
            queryParams
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          }
        }

        case "get_endpoint_details": {
          const params = args as {
            project: string
            path: string
            method: string
            version?: string
            spec?: string
          }
          const queryParams: Record<string, string> = {
            project: params.project,
            path: params.path,
            method: params.method,
          }
          if (params.version) queryParams.version = params.version
          if (params.spec) queryParams.spec = params.spec

          const result = await client.get<{ endpoint: unknown }>(
            "/api/cli/endpoint",
            queryParams
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          }
        }

        case "list_schemas": {
          const params = args as {
            project: string
            version?: string
            spec?: string
          }
          const queryParams: Record<string, string> = {
            project: params.project,
          }
          if (params.version) queryParams.version = params.version
          if (params.spec) queryParams.spec = params.spec

          const result = await client.get<{ schemas: string[] }>(
            "/api/cli/schemas",
            queryParams
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          }
        }

        case "get_schema": {
          const params = args as {
            project: string
            name: string
            version?: string
            spec?: string
          }
          const queryParams: Record<string, string> = {
            project: params.project,
            name: params.name,
          }
          if (params.version) queryParams.version = params.version
          if (params.spec) queryParams.spec = params.spec

          const result = await client.get<{ schema: unknown }>(
            "/api/cli/schema",
            queryParams
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
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

export async function runMCPServer(client: APIClient): Promise<void> {
  const server = createMCPServer(client)
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
