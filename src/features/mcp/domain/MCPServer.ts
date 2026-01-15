import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js"
import IProjectListDataSource from "@/features/projects/domain/IProjectListDataSource"
import IProjectDetailsDataSource from "@/features/projects/domain/IProjectDetailsDataSource"
import IGitHubClient from "@/common/github/IGitHubClient"
import { OpenAPIService } from "./OpenAPIService"
import {
  ListEndpointsArgsSchema,
  GetEndpointDetailsArgsSchema,
  ListSchemasArgsSchema,
  GetSchemaArgsSchema,
  SearchEndpointsArgsSchema,
  listProjects,
  listEndpoints,
  getEndpointDetails,
  listSchemas,
  getSchema,
  searchEndpoints,
} from "./tools"

interface MCPServerConfig {
  gitHubClient: IGitHubClient
  projectListDataSource: IProjectListDataSource
  projectDetailsDataSource: IProjectDetailsDataSource
}

const TOOLS: Tool[] = [
  {
    name: "list_projects",
    description: "List all available OpenAPI projects. Returns project names, owners, versions (branches/tags), and available specs for each version.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "list_endpoints",
    description: "List all endpoints in an OpenAPI spec. Returns path, method, summary, operationId, and tags for each endpoint.",
    inputSchema: {
      type: "object",
      properties: {
        projectName: { type: "string", description: "Name of the project" },
        version: { type: "string", description: "Version name (branch/tag). Defaults to default version." },
        specName: { type: "string", description: "Name of the spec file if project has multiple." },
      },
      required: ["projectName"],
    },
  },
  {
    name: "get_endpoint_details",
    description: "Get full details for a specific endpoint including parameters, request body, responses, and schemas.",
    inputSchema: {
      type: "object",
      properties: {
        projectName: { type: "string", description: "Name of the project" },
        path: { type: "string", description: "API path (e.g., /users/{id})" },
        method: { type: "string", description: "HTTP method (GET, POST, PUT, DELETE, etc.)" },
        version: { type: "string", description: "Version name (branch/tag)" },
        specName: { type: "string", description: "Name of the spec file" },
      },
      required: ["projectName", "path", "method"],
    },
  },
  {
    name: "list_schemas",
    description: "List all schema definitions in the OpenAPI spec's components.schemas section.",
    inputSchema: {
      type: "object",
      properties: {
        projectName: { type: "string", description: "Name of the project" },
        version: { type: "string", description: "Version name (branch/tag)" },
        specName: { type: "string", description: "Name of the spec file" },
      },
      required: ["projectName"],
    },
  },
  {
    name: "get_schema",
    description: "Get a specific schema definition with all its properties, types, and constraints.",
    inputSchema: {
      type: "object",
      properties: {
        projectName: { type: "string", description: "Name of the project" },
        schemaName: { type: "string", description: "Name of the schema in components.schemas" },
        version: { type: "string", description: "Version name (branch/tag)" },
        specName: { type: "string", description: "Name of the spec file" },
      },
      required: ["projectName", "schemaName"],
    },
  },
  {
    name: "search_endpoints",
    description: "Search endpoints by keyword. Searches path, summary, description, tags, and operationId.",
    inputSchema: {
      type: "object",
      properties: {
        projectName: { type: "string", description: "Name of the project" },
        query: { type: "string", description: "Search query" },
        version: { type: "string", description: "Version name (branch/tag)" },
        specName: { type: "string", description: "Name of the spec file" },
      },
      required: ["projectName", "query"],
    },
  },
]

export function createMCPServer(config: MCPServerConfig): Server {
  const server = new Server(
    { name: "framna-docs", version: "1.0.0" },
    { capabilities: { tools: {} } }
  )

  const openAPIService = new OpenAPIService({
    gitHubClient: config.gitHubClient,
    projectListDataSource: config.projectListDataSource,
    projectDetailsDataSource: config.projectDetailsDataSource,
  })

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS }
  })

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    switch (name) {
      case "list_projects":
        return listProjects(config.projectListDataSource, config.projectDetailsDataSource)
      case "list_endpoints":
        return listEndpoints(openAPIService, ListEndpointsArgsSchema.parse(args))
      case "get_endpoint_details":
        return getEndpointDetails(openAPIService, GetEndpointDetailsArgsSchema.parse(args))
      case "list_schemas":
        return listSchemas(openAPIService, ListSchemasArgsSchema.parse(args))
      case "get_schema":
        return getSchema(openAPIService, GetSchemaArgsSchema.parse(args))
      case "search_endpoints":
        return searchEndpoints(openAPIService, SearchEndpointsArgsSchema.parse(args))
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  })

  return server
}
