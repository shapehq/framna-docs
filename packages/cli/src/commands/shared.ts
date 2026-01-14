import chalk from "chalk"
import { getSession, getServerUrl } from "../config.js"
import { APIClient } from "../api.js"

export async function getAuthenticatedClient(): Promise<APIClient> {
  const session = await getSession()

  if (!session) {
    console.error(chalk.red("Not authenticated"))
    console.error(chalk.dim("Run 'framna-docs auth login' to authenticate"))
    process.exit(1)
  }

  return new APIClient(getServerUrl(), session.sessionId)
}

export function formatTable(headers: string[], rows: string[][]): string {
  const columnWidths = headers.map((h, i) => {
    const maxRowWidth = Math.max(...rows.map((r) => (r[i] || "").length))
    return Math.max(h.length, maxRowWidth)
  })

  const headerLine = headers.map((h, i) => h.padEnd(columnWidths[i])).join("  ")
  const separator = columnWidths.map((w) => "-".repeat(w)).join("  ")
  const dataLines = rows
    .map((row) => row.map((cell, i) => (cell || "").padEnd(columnWidths[i])).join("  "))
    .join("\n")

  return `${headerLine}\n${separator}\n${dataLines}`
}
