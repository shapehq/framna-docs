import useSWR from "swr"
import fetcher from "@/common/fetcher"
import IProject from "../domain/IProject"

type ProjectContainer = { projects: IProject[] }

export default function useProjects() {
  const { data, error, isLoading } = useSWR<ProjectContainer, any>(
    "/api/user/projects",
    fetcher
  )
  return {
    projects: data?.projects || [],
    isLoading,
    error
  }
}
