declare module "@stoplight/elements" {
  interface APIProps {
    apiDescriptionDocument?: string
    apiDescriptionUrl?: string
    basePath?: string
    router?: "history" | "hash" | "memory" | "static"
    layout?: "sidebar" | "stacked"
  }
  
  export const API: React.FC<APIProps>
}
