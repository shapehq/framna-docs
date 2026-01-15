import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import yaml from "yaml"
import { getOpenAPIService, resolveProject, formatTable } from "./shared.js"

export function createEndpointsCommand(): Command {
  return new Command("endpoints")
    .description("List API endpoints")
    .argument("<project>", "Project (owner/name)")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (projectId: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Fetching endpoints...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = resolveProject(projectId)
        const project = await service.getProject(owner, name)
        const endpoints = await service.listEndpoints(project, options.version, options.spec)

        spinner.stop()

        if (endpoints.length === 0) {
          console.log(chalk.yellow("No endpoints found"))
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
    .argument("<project>", "Project (owner/name)")
    .argument("<query>", "Search query")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (projectId: string, query: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Searching endpoints...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = resolveProject(projectId)
        const project = await service.getProject(owner, name)
        const endpoints = await service.searchEndpoints(project, query, options.version, options.spec)

        spinner.stop()

        if (endpoints.length === 0) {
          console.log(chalk.yellow("No endpoints found matching query"))
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

export function createEndpointCommand(): Command {
  return new Command("endpoint")
    .description("Get endpoint details with schemas")
    .argument("<project>", "Project (owner/name)")
    .argument("<path>", "Endpoint path (e.g., /users/{id})")
    .argument("<method>", "HTTP method")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .option("--json", "Output as JSON")
    .option("--yaml", "Output as YAML")
    .action(async (projectId: string, endpointPath: string, method: string, options: { version?: string; spec?: string; json?: boolean; yaml?: boolean }) => {
      const spinner = ora("Fetching endpoint...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = resolveProject(projectId)
        const project = await service.getProject(owner, name)
        const endpoint = await service.getEndpointSlice(project, endpointPath, method, options.version, options.spec)

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

        // Human-readable output
        console.log(chalk.bold(`${endpoint.method} ${endpoint.path}`))
        if (endpoint.summary) console.log(chalk.dim(endpoint.summary))
        if (endpoint.description) {
          console.log()
          console.log(endpoint.description)
        }
        console.log()

        if (endpoint.tags && endpoint.tags.length > 0) {
          console.log(chalk.bold("Tags:"), endpoint.tags.join(", "))
        }

        if (endpoint.operationId) {
          console.log(chalk.bold("Operation ID:"), endpoint.operationId)
        }

        if (endpoint.parameters && endpoint.parameters.length > 0) {
          console.log()
          console.log(chalk.bold("Parameters:"))
          for (const param of endpoint.parameters) {
            const required = param.required ? chalk.red("*") : ""
            console.log(`  ${param.name}${required} (${param.in}): ${param.description || ""}`)
          }
        }

        if (endpoint.responses) {
          console.log()
          console.log(chalk.bold("Responses:"))
          for (const [code, response] of Object.entries(endpoint.responses)) {
            const color = code.startsWith("2") ? chalk.green : code.startsWith("4") ? chalk.yellow : chalk.red
            console.log(`  ${color(code)}: ${response.description || ""}`)
          }
        }

        if (endpoint.schemas && Object.keys(endpoint.schemas).length > 0) {
          console.log()
          console.log(chalk.bold("Schemas:"), Object.keys(endpoint.schemas).join(", "))
          console.log(chalk.dim("Use --json or --yaml to see full schema definitions"))
        }
      } catch (error) {
        spinner.fail("Failed to fetch endpoint")
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
      }
    })
}
