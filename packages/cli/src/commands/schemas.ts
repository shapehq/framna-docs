import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import { getAuthenticatedClient } from "./shared.js"

export function createSchemasCommand(): Command {
  return new Command("schemas")
    .description("List API schemas")
    .argument("<project>", "Project name")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (project: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Fetching schemas...").start()

      try {
        const client = await getAuthenticatedClient()
        const params: Record<string, string> = { project }
        if (options.version) params.version = options.version
        if (options.spec) params.spec = options.spec

        const { schemas } = await client.get<{ schemas: string[] }>("/api/cli/schemas", params)

        spinner.stop()

        if (schemas.length === 0) {
          console.log(chalk.yellow("No schemas found"))
          return
        }

        console.log(chalk.bold("Schemas:"))
        for (const schema of schemas) {
          console.log(`  ${schema}`)
        }
      } catch (error) {
        spinner.fail("Failed to fetch schemas")
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
      }
    })
}

export function createSchemaCommand(): Command {
  return new Command("schema")
    .description("Get schema definition")
    .argument("<project>", "Project name")
    .argument("<name>", "Schema name")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (project: string, name: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Fetching schema...").start()

      try {
        const client = await getAuthenticatedClient()
        const params: Record<string, string> = { project, name }
        if (options.version) params.version = options.version
        if (options.spec) params.spec = options.spec

        const { schema } = await client.get<{ schema: unknown }>("/api/cli/schema", params)

        spinner.stop()

        console.log(chalk.bold(name))
        console.log()
        console.log(JSON.stringify(schema, null, 2))
      } catch (error) {
        spinner.fail("Failed to fetch schema")
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
      }
    })
}
