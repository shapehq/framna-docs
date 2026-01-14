import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import { getAuthenticatedClient, formatTable } from "./shared.js"

interface EndpointSummary {
  path: string
  method: string
  summary?: string
  operationId?: string
  tags?: string[]
}

export function createEndpointsCommand(): Command {
  return new Command("endpoints")
    .description("List API endpoints")
    .argument("<project>", "Project name")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (project: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Fetching endpoints...").start()

      try {
        const client = await getAuthenticatedClient()
        const params: Record<string, string> = { project }
        if (options.version) params.version = options.version
        if (options.spec) params.spec = options.spec

        const { endpoints } = await client.get<{ endpoints: EndpointSummary[] }>("/api/cli/endpoints", params)

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
    .argument("<project>", "Project name")
    .argument("<query>", "Search query")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (project: string, query: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Searching endpoints...").start()

      try {
        const client = await getAuthenticatedClient()
        const params: Record<string, string> = { project, query }
        if (options.version) params.version = options.version
        if (options.spec) params.spec = options.spec

        const { endpoints } = await client.get<{ endpoints: EndpointSummary[] }>("/api/cli/endpoints/search", params)

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
    .argument("<project>", "Project name")
    .argument("<path>", "Endpoint path (e.g., /users/{id})")
    .argument("<method>", "HTTP method")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (project: string, path: string, method: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Fetching endpoint details...").start()

      try {
        const client = await getAuthenticatedClient()
        const params: Record<string, string> = { project, path, method }
        if (options.version) params.version = options.version
        if (options.spec) params.spec = options.spec

        const { endpoint } = await client.get<{ endpoint: Record<string, unknown> }>("/api/cli/endpoint", params)

        spinner.stop()

        console.log(chalk.bold(`${method.toUpperCase()} ${path}`))
        if (endpoint.summary) console.log(chalk.dim(endpoint.summary as string))
        if (endpoint.description) {
          console.log()
          console.log(endpoint.description as string)
        }
        console.log()

        if (endpoint.tags && Array.isArray(endpoint.tags) && endpoint.tags.length > 0) {
          console.log(chalk.bold("Tags:"), (endpoint.tags as string[]).join(", "))
        }

        if (endpoint.operationId) {
          console.log(chalk.bold("Operation ID:"), endpoint.operationId as string)
        }

        if (endpoint.parameters && Array.isArray(endpoint.parameters) && endpoint.parameters.length > 0) {
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
