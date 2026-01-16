import { jest, describe, it, expect, beforeEach } from "@jest/globals"

// Mock config module to avoid file system access
jest.unstable_mockModule("@framna-docs/cli/dist/config.js", () => ({
  getSession: jest.fn(),
  getServerUrl: jest.fn().mockReturnValue("http://localhost:3000"),
}))

// Mock API client
jest.unstable_mockModule("@framna-docs/cli/dist/api.js", () => ({
  APIClient: jest.fn().mockImplementation(() => ({})),
}))

// Mock OpenAPI service
jest.unstable_mockModule("@framna-docs/cli/dist/openapi/index.js", () => ({
  OpenAPIService: jest.fn().mockImplementation(() => ({})),
}))

describe("CLI shared utilities", () => {
  let resolveProject: (id: string) => { owner: string; name: string }
  let formatTable: (headers: string[], rows: string[][]) => string

  beforeEach(async () => {
    jest.clearAllMocks()
    const shared = await import("@framna-docs/cli/dist/commands/shared.js")
    resolveProject = shared.resolveProject
    formatTable = shared.formatTable
  })

  describe("resolveProject", () => {
    it("parses owner/name format correctly", () => {
      const result = resolveProject("shapehq/plus")

      expect(result).toEqual({
        owner: "shapehq",
        name: "plus",
      })
    })

    it("handles names with hyphens", () => {
      const result = resolveProject("my-org/my-project-name")

      expect(result).toEqual({
        owner: "my-org",
        name: "my-project-name",
      })
    })

    it("handles names with underscores", () => {
      const result = resolveProject("my_org/my_project")

      expect(result).toEqual({
        owner: "my_org",
        name: "my_project",
      })
    })

    it("throws error for invalid format without slash", () => {
      expect(() => resolveProject("invalid")).toThrow(
        "Invalid project format: invalid. Use owner/name format."
      )
    })

    it("throws error for empty string", () => {
      expect(() => resolveProject("")).toThrow(
        "Invalid project format: . Use owner/name format."
      )
    })
  })

  describe("formatTable", () => {
    it("creates table with headers and rows", () => {
      const result = formatTable(
        ["NAME", "VALUE"],
        [
          ["foo", "bar"],
          ["baz", "qux"],
        ]
      )

      expect(result).toContain("NAME")
      expect(result).toContain("VALUE")
      expect(result).toContain("foo")
      expect(result).toContain("bar")
      expect(result).toContain("baz")
      expect(result).toContain("qux")
    })

    it("handles empty rows", () => {
      const result = formatTable(["HEADER"], [])

      expect(result).toContain("HEADER")
    })

    it("handles single column", () => {
      const result = formatTable(["ITEMS"], [["item1"], ["item2"]])

      expect(result).toContain("ITEMS")
      expect(result).toContain("item1")
      expect(result).toContain("item2")
    })

    it("uses box-drawing characters", () => {
      const result = formatTable(["A", "B"], [["1", "2"]])

      // Should contain box-drawing characters
      expect(result).toMatch(/[┌┐└┘│─┬┴├┤┼]/)
    })
  })
})
