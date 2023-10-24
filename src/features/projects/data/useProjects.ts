import useSWR from "swr"
import fetcher from "@/common/utils/fetcher"
import Project from "../domain/Project"

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
