import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import yaml from "yaml"
import { OpenAPIV3 } from "openapi-types"
import { getOpenAPIService, resolveProject, formatTable } from "./shared.js"

interface SpecOptions {
  project: string
  at: string
  spec: string
  json?: boolean
  yaml?: boolean
}

export function createEndpointsCommand(): Command {
  return new Command("endpoints")
    .description("Endpoint commands")
}

export function createEndpointsListCommand(): Command {
  return new Command("list")
    .description("List API endpoints")
    .requiredOption("-p, --project <project>", "Project (owner/name)")
    .requiredOption("-a, --at <version>", "API version name")
    .requiredOption("-s, --spec <spec>", "Spec name")
    .option("--json", "Output as JSON")
    .option("--yaml", "Output as YAML")
    .action(async (options: SpecOptions) => {
      const spinner = ora("Fetching endpoints...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = resolveProject(options.project)
        const project = await service.getProject(owner, name)
        const endpoints = await service.listEndpoints(project, options.at, options.spec)

        spinner.stop()

        if (endpoints.length === 0) {
          console.log(chalk.yellow("No endpoints found"))
          return
        }

        if (options.json) {
          console.log(JSON.stringify(endpoints, null, 2))
          return
        }
        if (options.yaml) {
          console.log(yaml.stringify(endpoints, { aliasDuplicateObjects: false }))
          return
        }

        const rows = endpoints.map((e) => [
          chalk.bold(e.method.toUpperCase()),
          e.path,
          e.summary || "",
          e.operationId || "",
        ])

        console.log(formatTable(["METHOD", "PATH", "SUMMARY", "OPERATION ID"], rows))
      } catch (error) {
        spinner.fail("Failed to fetch endpoints")
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
      }
    })
}

export function createEndpointsSearchCommand(): Command {
  return new Command("search")
    .description("Search endpoints")
    .argument("<query>", "Search query")
    .requiredOption("-p, --project <project>", "Project (owner/name)")
    .requiredOption("-a, --at <version>", "API version name")
    .requiredOption("-s, --spec <spec>", "Spec name")
    .option("--json", "Output as JSON")
    .option("--yaml", "Output as YAML")
    .action(async (query: string, options: SpecOptions) => {
      const spinner = ora("Searching endpoints...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = resolveProject(options.project)
        const project = await service.getProject(owner, name)
        const endpoints = await service.searchEndpoints(project, query, options.at, options.spec)

        spinner.stop()

        if (endpoints.length === 0) {
          console.log(chalk.yellow("No endpoints found matching query"))
          return
        }

        if (options.json) {
          console.log(JSON.stringify(endpoints, null, 2))
          return
        }
        if (options.yaml) {
          console.log(yaml.stringify(endpoints, { aliasDuplicateObjects: false }))
          return
        }

        const rows = endpoints.map((e) => [
          chalk.bold(e.method.toUpperCase()),
          e.path,
          e.summary || "",
        ])

        console.log(formatTable(["METHOD", "PATH", "SUMMARY"], rows))
      } catch (error) {
        spinner.fail("Search failed")
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
      }
    })
}

export function createEndpointGetCommand(): Command {
  return new Command("get")
    .description("Get endpoint details with schemas")
    .argument("<path>", "Endpoint path (e.g., /users/{id})")
    .argument("<method>", "HTTP method")
    .requiredOption("-p, --project <project>", "Project (owner/name)")
    .requiredOption("-a, --at <version>", "API version name")
    .requiredOption("-s, --spec <spec>", "Spec name")
    .option("--json", "Output as JSON")
    .option("--yaml", "Output as YAML")
    .action(async (endpointPath: string, method: string, options: SpecOptions & { json?: boolean; yaml?: boolean }) => {
      const spinner = ora("Fetching endpoint...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = resolveProject(options.project)
        const project = await service.getProject(owner, name)
        const endpoint = await service.getEndpointSlice(project, endpointPath, method, options.at, options.spec)

        spinner.stop()

        if (!endpoint) {
          console.log(chalk.yellow("Endpoint not found"))
          return
        }

        // JSON or YAML output
        if (options.json) {
          console.log(JSON.stringify(endpoint, null, 2))
          return
        }
        if (options.yaml) {
          console.log(yaml.stringify(endpoint, { aliasDuplicateObjects: false }))
          return
        }

        // Human-readable output - extract from OpenAPI document
        const pathItem = endpoint.paths?.[endpointPath] as OpenAPIV3.PathItemObject
        const operation = pathItem?.[method.toLowerCase() as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject

        console.log(chalk.bold(`${method.toUpperCase()} ${endpointPath}`))
        if (operation?.summary) console.log(chalk.dim(operation.summary))
        if (operation?.description) {
          console.log()
          console.log(operation.description)
        }
        console.log()

        if (operation?.tags && operation.tags.length > 0) {
          console.log(chalk.bold("Tags:"), operation.tags.join(", "))
        }

        if (operation?.operationId) {
          console.log(chalk.bold("Operation ID:"), operation.operationId)
        }

        const parameters = operation?.parameters as OpenAPIV3.ParameterObject[] | undefined
        if (parameters && parameters.length > 0) {
          console.log()
          console.log(chalk.bold("Parameters:"))
          const paramRows = parameters.map((param) => [
            param.name,
            param.in,
            param.required ? chalk.red("required") : "optional",
            param.description || "",
          ])
          console.log(formatTable(["NAME", "IN", "REQUIRED", "DESCRIPTION"], paramRows))
        }

        if (operation?.responses) {
          console.log()
          console.log(chalk.bold("Responses:"))
          const responseRows = Object.entries(operation.responses).map(([code, response]) => {
            const resp = response as OpenAPIV3.ResponseObject
            const color = code.startsWith("2") ? chalk.green : code.startsWith("4") ? chalk.yellow : chalk.red
            return [color(code), resp.description || ""]
          })
          console.log(formatTable(["CODE", "DESCRIPTION"], responseRows))
        }

        const schemas = endpoint.components?.schemas
        if (schemas && Object.keys(schemas).length > 0) {
          console.log()
          console.log(chalk.bold("Referenced Schemas:"))
          const schemaRows = Object.keys(schemas).map((name) => [name])
          console.log(formatTable(["SCHEMA"], schemaRows))
          console.log(chalk.dim("Use --json or --yaml to see full schema definitions"))
        }
      } catch (error) {
        spinner.fail("Failed to fetch endpoint")
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
      }
    })
}
