import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import yaml from "yaml"
import { getAuthenticatedClient, formatTable } from "./shared.js"
import { Project, ProjectSummary } from "../types.js"

interface OutputOptions {
  json?: boolean
  yaml?: boolean
}

export function createProjectsCommand(): Command {
  return new Command("projects")
    .description("List all projects")
    .option("--json", "Output as JSON")
    .option("--yaml", "Output as YAML")
    .action(async (options: OutputOptions) => {
      const spinner = ora("Fetching projects...").start()

      try {
        const client = await getAuthenticatedClient()
        const { projects } = await client.get<{ projects: ProjectSummary[] }>("/api/cli/projects")

        spinner.stop()

        if (projects.length === 0) {
          console.log(chalk.yellow("No projects found"))
          return
        }

        if (options.json) {
          console.log(JSON.stringify(projects, null, 2))
          return
        }
        if (options.yaml) {
          console.log(yaml.stringify(projects, { aliasDuplicateObjects: false }))
          return
        }

        const rows = projects.map((p) => [
          `${p.owner}/${p.name}`,
          p.displayName,
        ])

        console.log(formatTable(["PROJECT", "DISPLAY NAME"], rows))
        console.log(chalk.dim(`\nUse 'project <owner/name>' to see versions and specs`))
      } catch (error) {
        spinner.fail("Failed to fetch projects")
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
      }
    })
}

export function createProjectCommand(): Command {
  return new Command("project")
    .description("Get project details")
    .argument("<project>", "Project identifier (owner/name)")
    .option("--json", "Output as JSON")
    .option("--yaml", "Output as YAML")
    .action(async (projectId: string, options: OutputOptions) => {
      const spinner = ora("Fetching project...").start()

      try {
        const client = await getAuthenticatedClient()
        const { project } = await client.get<{ project: Project }>(`/api/cli/projects/${projectId}`)

        spinner.stop()

        if (options.json) {
          console.log(JSON.stringify(project, null, 2))
          return
        }
        if (options.yaml) {
          console.log(yaml.stringify(project, { aliasDuplicateObjects: false }))
          return
        }

        console.log(chalk.bold(project.displayName))
        console.log(chalk.dim(`Owner: ${project.owner}`))
        console.log()

        console.log(chalk.bold("Versions:"))
        for (const version of project.versions) {
          const defaultMark = version.isDefault ? chalk.green(" (default)") : ""
          console.log(`  ${version.name}${defaultMark}`)

          for (const spec of version.specifications) {
            const specDefault = spec.isDefault ? chalk.green(" *") : ""
            console.log(chalk.dim(`    - ${spec.name}${specDefault}`))
          }
        }
      } catch (error) {
        spinner.fail("Failed to fetch project")
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
      }
    })
}
