import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import { getOpenAPIService, resolveProject, formatTable } from "./shared.js"

export function createEndpointsCommand(): Command {
  return new Command("endpoints")
    .description("List API endpoints")
    .argument("<project>", "Project name or owner/name")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (projectId: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Fetching endpoints...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = await resolveProject(service, projectId)
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
    .argument("<project>", "Project name or owner/name")
    .argument("<query>", "Search query")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (projectId: string, query: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Searching endpoints...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = await resolveProject(service, projectId)
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
    .description("Get endpoint details")
    .argument("<project>", "Project name or owner/name")
    .argument("<path>", "Endpoint path (e.g., /users/{id})")
    .argument("<method>", "HTTP method")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (projectId: string, endpointPath: string, method: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Fetching endpoint details...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = await resolveProject(service, projectId)
        const project = await service.getProject(owner, name)
        const endpoint = await service.getEndpointDetails(project, endpointPath, method, options.version, options.spec)

        spinner.stop()

        if (!endpoint) {
          console.log(chalk.yellow("Endpoint not found"))
          return
        }

        console.log(chalk.bold(`${method.toUpperCase()} ${endpointPath}`))
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
          for (const param of endpoint.parameters as Array<{ name: string; required?: boolean; in: string; description?: string }>) {
            const required = param.required ? chalk.red("*") : ""
            console.log(`  ${param.name}${required} (${param.in}): ${param.description || ""}`)
          }
        }

        if (endpoint.responses && typeof endpoint.responses === "object") {
          console.log()
          console.log(chalk.bold("Responses:"))
          for (const [code, response] of Object.entries(endpoint.responses as Record<string, { description?: string }>)) {
            const color = code.startsWith("2") ? chalk.green : code.startsWith("4") ? chalk.yellow : chalk.red
            console.log(`  ${color(code)}: ${response.description || ""}`)
          }
        }
      } catch (error) {
        spinner.fail("Failed to fetch endpoint")
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
      }
    })
}
