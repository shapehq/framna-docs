import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import yaml from "yaml"
import { getOpenAPIService, resolveProject } from "./shared.js"

interface SpecOptions {
  project: string
  at: string
  spec: string
  json?: boolean
  yaml?: boolean
}

export function createSpecCommand(): Command {
  return new Command("spec")
    .description("Get full OpenAPI specification")
    .requiredOption("-p, --project <project>", "Project (owner/name)")
    .requiredOption("-a, --at <version>", "API version name")
    .requiredOption("-s, --spec <spec>", "Spec name")
    .option("--json", "Output as JSON (default)")
    .option("--yaml", "Output as YAML")
    .action(async (options: SpecOptions) => {
      const spinner = ora("Fetching spec...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = resolveProject(options.project)
        const project = await service.getProject(owner, name)
        const spec = await service.getSpec(project, options.at, options.spec)

        spinner.stop()

        if (options.yaml) {
          console.log(yaml.stringify(spec, { aliasDuplicateObjects: false }))
        } else {
          console.log(JSON.stringify(spec, null, 2))
        }
      } catch (error) {
        spinner.fail("Failed to fetch spec")
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
      }
    })
}
