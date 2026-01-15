import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import { getOpenAPIService, resolveProject } from "./shared.js"

export function createSchemasCommand(): Command {
  return new Command("schemas")
    .description("List API schemas")
    .argument("<project>", "Project (owner/name)")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (projectId: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Fetching schemas...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = resolveProject(projectId)
        const project = await service.getProject(owner, name)
        const schemas = await service.listSchemas(project, options.version, options.spec)

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
    .argument("<project>", "Project (owner/name)")
    .argument("<name>", "Schema name")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (projectId: string, schemaName: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Fetching schema...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = resolveProject(projectId)
        const project = await service.getProject(owner, name)
        const schema = await service.getSchema(project, schemaName, options.version, options.spec)

        spinner.stop()

        if (!schema) {
          console.log(chalk.yellow("Schema not found"))
          return
        }

        console.log(chalk.bold(schemaName))
        console.log()
        console.log(JSON.stringify(schema, null, 2))
      } catch (error) {
        spinner.fail("Failed to fetch schema")
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
      }
    })
}
