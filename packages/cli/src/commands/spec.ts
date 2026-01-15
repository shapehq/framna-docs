import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import yaml from "yaml"
import { getOpenAPIService, resolveProject } from "./shared.js"

export function createSpecCommand(): Command {
  return new Command("spec")
    .description("Get full OpenAPI specification")
    .argument("<project>", "Project (owner/name)")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .option("--json", "Output as JSON (default)")
    .option("--yaml", "Output as YAML")
    .action(async (projectId: string, options: { version?: string; spec?: string; json?: boolean; yaml?: boolean }) => {
      const spinner = ora("Fetching spec...").start()

      try {
        const service = await getOpenAPIService()
        const { owner, name } = resolveProject(projectId)
        const project = await service.getProject(owner, name)
        const spec = await service.getSpec(project, options.version, options.spec)

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
