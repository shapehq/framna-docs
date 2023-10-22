import { useLocalStorage } from "usehooks-ts"
import DocumentationVisualizer from "@/features/settings/domain/DocumentationVisualizer"

export default function useDocumentationVisualizer() {
  return useLocalStorage("documentationVisualizer", DocumentationVisualizer.SWAGGER)
}
