"use client"

import useSWR from "swr"
import { fetcher } from "../../../../common"

type RepositoriesContainer = { repositories: string[] }

export default function useRepositoryAccess() {
  const { data, error, isLoading } = useSWR<RepositoriesContainer, Error>(
    "/api/user/repository-access",
    fetcher
  )
  return {
    repositories: data?.repositories || [],
    isLoading,
    error
  }
}
