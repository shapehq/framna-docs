import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import yaml from "yaml"
import { getOpenAPIService, resolveProject } from "./shared.js"

interface SpecOptions {
  project: string
  apiVersion: string
  spec: string
  json?: boolean
  yaml?: boolean
}

export function createSchemasCommand(): Command {
  return new Command("schemas")
    .description("List API schemas")
    .requiredOption("-p, --project <project>", "Project (owner/name)")
    .requiredOption("-a, --api-version <version>", "API version name")
    .requiredOption("-s, --spec <spec>", "Spec name")
    .option("--json", "Output as JSON")
    .option("--yaml", "Output as YAML")
    .action(async (options: SpecOptions) => {
      const spinner = ora("Fetching schemas...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = resolveProject(options.project)
        const project = await service.getProject(owner, name)
        const schemas = await service.listSchemas(project, options.apiVersion, options.spec)

        spinner.stop()

        if (schemas.length === 0) {
          console.log(chalk.yellow("No schemas found"))
          return
        }

        if (options.json) {
          console.log(JSON.stringify(schemas, null, 2))
          return
        }
        if (options.yaml) {
          console.log(yaml.stringify(schemas, { aliasDuplicateObjects: false }))
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
    .argument("<name>", "Schema name")
    .requiredOption("-p, --project <project>", "Project (owner/name)")
    .requiredOption("-a, --api-version <version>", "API version name")
    .requiredOption("-s, --spec <spec>", "Spec name")
    .option("--json", "Output as JSON")
    .option("--yaml", "Output as YAML")
    .action(async (schemaName: string, options: SpecOptions) => {
      const spinner = ora("Fetching schema...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = resolveProject(options.project)
        const project = await service.getProject(owner, name)
        const schema = await service.getSchema(project, schemaName, options.apiVersion, options.spec)

        spinner.stop()

        if (!schema) {
          console.log(chalk.yellow("Schema not found"))
          return
        }

        if (options.json) {
          console.log(JSON.stringify(schema, null, 2))
          return
        }
        if (options.yaml) {
          console.log(yaml.stringify(schema, { aliasDuplicateObjects: false }))
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
