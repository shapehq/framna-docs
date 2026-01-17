import { jest, describe, it, expect, beforeEach } from "@jest/globals"

// Mock global fetch
const mockFetch = jest.fn() as jest.Mock
global.fetch = mockFetch

describe("APIClient", () => {
  let APIClient: new (baseUrl: string, sessionId?: string) => {
    get<T>(path: string, params?: Record<string, string>): Promise<T>
    post<T>(path: string, body?: unknown): Promise<T>
    getRaw(path: string): Promise<string>
  }
  let APIError: new (message: string, status: number) => Error & { status: number }

  beforeEach(async () => {
    jest.clearAllMocks()
    const api = await import("@framna-docs/cli/dist/api.js")
    APIClient = api.APIClient
    APIError = api.APIError
  })

  describe("get", () => {
    it("makes GET request to correct URL", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      })

      const client = new APIClient("https://api.example.com")
      await client.get("/api/test")

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/test",
        expect.objectContaining({ method: "GET" })
      )
    })

    it("includes query parameters", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      })

      const client = new APIClient("https://api.example.com")
      await client.get("/api/test", { foo: "bar", baz: "qux" })

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/test?foo=bar&baz=qux",
        expect.any(Object)
      )
    })

    it("includes Authorization header when sessionId provided", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      })

      const client = new APIClient("https://api.example.com", "my-session-id")
      await client.get("/api/test")

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer my-session-id",
          }),
        })
      )
    })

    it("throws APIError on non-ok response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: "Not found" }),
      })

      const client = new APIClient("https://api.example.com")

      await expect(client.get("/api/test")).rejects.toThrow("Not found")
    })

    it("returns data on success", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: "test-value" }),
      })

      const client = new APIClient("https://api.example.com")
      const result = await client.get<{ data: string }>("/api/test")

      expect(result.data).toBe("test-value")
    })
  })

  describe("post", () => {
    it("makes POST request with JSON body", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      const client = new APIClient("https://api.example.com")
      await client.post("/api/test", { foo: "bar" })

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ foo: "bar" }),
        })
      )
    })

    it("includes Content-Type header", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      const client = new APIClient("https://api.example.com")
      await client.post("/api/test", { foo: "bar" })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      )
    })

    it("allows POST without body", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      const client = new APIClient("https://api.example.com")
      await client.post("/api/test")

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          body: undefined,
        })
      )
    })

    it("throws APIError on non-ok response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: "Bad request" }),
      })

      const client = new APIClient("https://api.example.com")

      await expect(client.post("/api/test")).rejects.toThrow("Bad request")
    })
  })

  describe("getRaw", () => {
    it("returns raw text response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("raw response content"),
      })

      const client = new APIClient("https://api.example.com")
      const result = await client.getRaw("/api/test")

      expect(result).toBe("raw response content")
    })

    it("throws APIError on non-ok response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      })

      const client = new APIClient("https://api.example.com")

      await expect(client.getRaw("/api/test")).rejects.toThrow("Request failed")
    })
  })

  describe("APIError", () => {
    it("has correct name and status", () => {
      const error = new APIError("Test error", 404)

      expect(error.name).toBe("APIError")
      expect(error.message).toBe("Test error")
      expect(error.status).toBe(404)
    })
  })
})
