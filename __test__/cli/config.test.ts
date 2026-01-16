import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals"
import * as fs from "fs/promises"
import * as path from "path"
import * as os from "os"

// Mock fs module
jest.unstable_mockModule("fs/promises", () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
  unlink: jest.fn(),
}))

describe("CLI config", () => {
  let getSession: () => Promise<{ sessionId: string; createdAt: string } | null>
  let saveSession: (sessionId: string) => Promise<void>
  let deleteSession: () => Promise<void>
  let getServerUrl: () => string
  let mockFs: {
    readFile: jest.Mock
    writeFile: jest.Mock
    mkdir: jest.Mock
    unlink: jest.Mock
  }

  const expectedConfigDir = path.join(os.homedir(), ".framna-docs")
  const expectedSessionPath = path.join(expectedConfigDir, "session.json")

  beforeEach(async () => {
    jest.clearAllMocks()
    mockFs = (await import("fs/promises")) as typeof mockFs
    const config = await import("@framna-docs/cli/dist/config.js")
    getSession = config.getSession
    saveSession = config.saveSession
    deleteSession = config.deleteSession
    getServerUrl = config.getServerUrl
  })

  describe("getSession", () => {
    it("returns null when session file does not exist", async () => {
      mockFs.readFile.mockRejectedValue(new Error("ENOENT"))

      const session = await getSession()

      expect(session).toBeNull()
    })

    it("returns null when session file contains invalid JSON", async () => {
      mockFs.readFile.mockResolvedValue("not json")

      const session = await getSession()

      expect(session).toBeNull()
    })

    it("returns null when session file contains invalid schema", async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({ invalid: "data" }))

      const session = await getSession()

      expect(session).toBeNull()
    })

    it("returns session when valid", async () => {
      const validSession = {
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        createdAt: "2026-01-16T10:00:00.000Z",
      }
      mockFs.readFile.mockResolvedValue(JSON.stringify(validSession))

      const session = await getSession()

      expect(session).toEqual(validSession)
      expect(mockFs.readFile).toHaveBeenCalledWith(expectedSessionPath, "utf-8")
    })
  })

  describe("saveSession", () => {
    it("creates config directory with 0700 permissions", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.writeFile.mockResolvedValue(undefined)

      await saveSession("550e8400-e29b-41d4-a716-446655440000")

      expect(mockFs.mkdir).toHaveBeenCalledWith(expectedConfigDir, {
        recursive: true,
        mode: 0o700,
      })
    })

    it("writes session file with 0600 permissions", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.writeFile.mockResolvedValue(undefined)

      await saveSession("550e8400-e29b-41d4-a716-446655440000")

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expectedSessionPath,
        expect.stringContaining("550e8400-e29b-41d4-a716-446655440000"),
        { mode: 0o600 }
      )
    })

    it("includes createdAt timestamp", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.writeFile.mockResolvedValue(undefined)

      await saveSession("550e8400-e29b-41d4-a716-446655440000")

      const writtenContent = mockFs.writeFile.mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      expect(parsed.createdAt).toBeDefined()
      expect(new Date(parsed.createdAt).getTime()).not.toBeNaN()
    })
  })

  describe("deleteSession", () => {
    it("deletes session file", async () => {
      mockFs.unlink.mockResolvedValue(undefined)

      await deleteSession()

      expect(mockFs.unlink).toHaveBeenCalledWith(expectedSessionPath)
    })

    it("does not throw when file does not exist", async () => {
      mockFs.unlink.mockRejectedValue(new Error("ENOENT"))

      await expect(deleteSession()).resolves.not.toThrow()
    })
  })

  describe("getServerUrl", () => {
    const originalEnv = process.env.FRAMNA_DOCS_URL

    afterEach(() => {
      if (originalEnv === undefined) {
        delete process.env.FRAMNA_DOCS_URL
      } else {
        process.env.FRAMNA_DOCS_URL = originalEnv
      }
    })

    it("returns localhost when FRAMNA_DOCS_URL is not set", () => {
      delete process.env.FRAMNA_DOCS_URL

      expect(getServerUrl()).toBe("http://localhost:3000")
    })

    it("returns FRAMNA_DOCS_URL when set", () => {
      process.env.FRAMNA_DOCS_URL = "https://docs.example.com"

      // Need to re-import to pick up env change
      expect(getServerUrl()).toBe("https://docs.example.com")
    })
  })
})
