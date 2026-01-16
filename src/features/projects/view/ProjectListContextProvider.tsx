"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ProjectSummary } from "@/features/projects/domain"
import { ProjectListContext } from "./ProjectListContext"

// Fingerprint for change detection - avoids unnecessary re-renders
const fingerprint = (list: ProjectSummary[]) =>
  list.map(p => `${p.owner}/${p.name}`).sort().join()

export default function ProjectListContextProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isLoadingRef = useRef(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true

    const controller = new AbortController()

    fetch("/api/projects", { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(({ projects: newProjects }) => {
        setProjects(prev =>
          fingerprint(prev) === fingerprint(newProjects || []) ? prev : (newProjects || [])
        )
        setError(null)
      })
      .catch(err => {
        if (err.name === "AbortError") return
        console.error("Failed to fetch project list:", err)
        setError("Failed to load projects")
      })
      .finally(() => {
        isLoadingRef.current = false
        setLoading(false)
      })

    return () => {
      isLoadingRef.current = false
      controller.abort()
    }
  }, [refreshTrigger])

  // Refresh on visibility change and focus (restored from original implementation)
  useEffect(() => {
    const timeout = window.setTimeout(() => refresh(), 0)
    const handleVisibilityChange = () => {
      if (!document.hidden) refresh()
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", refresh)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", refresh)
      window.clearTimeout(timeout)
    }
  }, [refresh])

  return (
    <ProjectListContext.Provider value={{ projects, loading, error, refresh }}>
      {children}
    </ProjectListContext.Provider>
  )
}
