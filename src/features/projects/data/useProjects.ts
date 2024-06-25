"use client"

import useSWR from "swr"
import { fetcher } from "@/common"
import { Project } from "../domain"

type ProjectContainer = { projects: Project[] }

export default function useProjects() {
  const { data, error, isLoading } = useSWR<ProjectContainer, Error>(
    "/api/user/projects",
    fetcher
  )
  return {
    projects: data?.projects || [],
    isLoading,
    error
  }
}
