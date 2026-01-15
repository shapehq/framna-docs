"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ProjectSummary } from "@/features/projects/domain"
import { ProjectListContext } from "./ProjectListContext"

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
      .then(({ projects }) => {
        setProjects(projects || [])
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
      controller.abort()
    }
  }, [refreshTrigger])

  return (
    <ProjectListContext.Provider value={{ projects, loading, error, refresh }}>
      {children}
    </ProjectListContext.Provider>
  )
}
