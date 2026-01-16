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

  const fetchProjects = useCallback((forceRefresh: boolean) => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true

    const url = forceRefresh ? "/api/projects?refresh=true" : "/api/projects"
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(({ projects: newProjects }) => {
        setProjects(newProjects || [])
        setError(null)
      })
      .catch(err => {
        console.error("Failed to fetch project list:", err)
        setError("Failed to load projects")
      })
      .finally(() => {
        isLoadingRef.current = false
        setLoading(false)
      })
  }, [])

  const refresh = useCallback(() => {
    fetchProjects(true)
  }, [fetchProjects])

  // Initial load (use cache), then refresh to get fresh data
  useEffect(() => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true

    fetch("/api/projects")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(({ projects: newProjects }) => {
        setProjects(newProjects || [])
        setError(null)
        setLoading(false)
        // After showing cached data, fetch fresh data
        return fetch("/api/projects?refresh=true")
      })
      .then(res => {
        if (!res || !res.ok) return null
        return res.json()
      })
      .then(data => {
        if (data?.projects) {
          setProjects(data.projects)
        }
      })
      .catch(err => {
        console.error("Failed to fetch project list:", err)
        setError("Failed to load projects")
        setLoading(false)
      })
      .finally(() => {
        isLoadingRef.current = false
      })
  }, [])

  // Refresh on visibility change and focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) refresh()
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", refresh)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", refresh)
    }
  }, [refresh])

  return (
    <ProjectListContext.Provider value={{ projects, loading, error, refresh }}>
      {children}
    </ProjectListContext.Provider>
  )
}
