export {}

declare global {
  interface Window {
    SwaggerUIBundle: (options: unknown) => unknown
  }
}
