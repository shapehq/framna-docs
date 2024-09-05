"use client"

import { useLocalStorage } from "usehooks-ts"
import { DocumentationVisualizer } from "@/features/settings/domain"

export default function useDocumentationVisualizer() {
  return useLocalStorage("documentationVisualizer", DocumentationVisualizer.SWAGGER)
}
