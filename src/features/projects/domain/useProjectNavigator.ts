"use client"
import { useRouter } from "next/navigation"
import ProjectNavigator from "./ProjectNavigator"

export default function useProjectNavigator() {
  const router = useRouter()
  const pathnameReader = {
    get pathname() {
      if (typeof window === "undefined") {
        return ""
      }
      return window.location.pathname
    }
  }
  return new ProjectNavigator({ router, pathnameReader })
}
