export class APIError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = "APIError"
  }
}

type Headers = Record<string, string>

interface ErrorResponse {
  error?: string
}

export class APIClient {
  constructor(
    private baseUrl: string,
    private sessionId?: string
  ) {}

  private getHeaders(): Headers {
    const headers: Headers = {
      "Content-Type": "application/json",
    }

    if (this.sessionId) {
      headers["Authorization"] = `Bearer ${this.sessionId}`
    }

    return headers
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(path, this.baseUrl)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, value)
        }
      })
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    })

    const data = (await response.json()) as T & ErrorResponse

    if (!response.ok) {
      throw new APIError(data.error || "Request failed", response.status)
    }

    return data
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = new URL(path, this.baseUrl)

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = (await response.json()) as T & ErrorResponse

    if (!response.ok) {
      throw new APIError(data.error || "Request failed", response.status)
    }

    return data
  }

  async getRaw(path: string): Promise<string> {
    const url = new URL(path, this.baseUrl)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new APIError("Request failed", response.status)
    }

    return response.text()
  }
}
