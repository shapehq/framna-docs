import * as fs from "fs/promises"
import * as path from "path"
import * as os from "os"
import { z } from "zod"

const SessionSchema = z.object({
  sessionId: z.string().uuid(),
  createdAt: z.string().datetime(),
})

export type Session = z.infer<typeof SessionSchema>

const CONFIG_DIR = ".framna-docs"
const SESSION_FILE = "session.json"

function getConfigDir(): string {
  return path.join(os.homedir(), CONFIG_DIR)
}

function getSessionPath(): string {
  return path.join(getConfigDir(), SESSION_FILE)
}

export async function getSession(): Promise<Session | null> {
  try {
    const content = await fs.readFile(getSessionPath(), "utf-8")
    const data = JSON.parse(content)
    return SessionSchema.parse(data)
  } catch {
    return null
  }
}

export async function saveSession(sessionId: string): Promise<void> {
  const configDir = getConfigDir()
  await fs.mkdir(configDir, { recursive: true })

  const session: Session = {
    sessionId,
    createdAt: new Date().toISOString(),
  }

  await fs.writeFile(getSessionPath(), JSON.stringify(session, null, 2))
}

export async function deleteSession(): Promise<void> {
  try {
    await fs.unlink(getSessionPath())
  } catch {
    // Ignore if file doesn't exist
  }
}

export function getServerUrl(): string {
  const url = process.env.FRAMNA_DOCS_URL
  if (!url) {
    // Default to localhost in development, require explicit URL in production
    return "http://localhost:3000"
  }
  return url
}
