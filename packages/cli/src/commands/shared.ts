import chalk from "chalk"
import Table from "cli-table3"
import { getSession, getServerUrl } from "../config.js"
import { APIClient } from "../api.js"
import { OpenAPIService } from "../openapi/index.js"

export async function getAuthenticatedClient(): Promise<APIClient> {
  const session = await getSession()

  if (!session) {
    console.error(chalk.red("Not authenticated"))
    console.error(chalk.dim("Run 'framna-docs auth login' to authenticate"))
    process.exit(1)
  }

  return new APIClient(getServerUrl(), session.sessionId)
}

export async function getOpenAPIService(): Promise<OpenAPIService> {
  const session = await getSession()
  if (!session) {
    console.error(chalk.red("Not authenticated"))
    console.error(chalk.dim("Run 'framna-docs auth login' to authenticate"))
    process.exit(1)
  }
  const client = new APIClient(getServerUrl(), session.sessionId)
  return new OpenAPIService(client, session.sessionId)
}

export function resolveProject(id: string): { owner: string; name: string } {
  if (!id.includes("/")) {
    throw new Error(`Invalid project format: ${id}. Use owner/name format.`)
  }
  const [owner, name] = id.split("/")
  return { owner, name }
}

export function formatTable(headers: string[], rows: string[][]): string {
  const table = new Table({
    head: headers.map(h => chalk.bold(h)),
    style: {
      head: [],
      border: [],
    },
    chars: {
      'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
      'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
      'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
      'right': '│', 'right-mid': '┤', 'middle': '│'
    }
  })

  for (const row of rows) {
    table.push(row)
  }

  return table.toString()
}
