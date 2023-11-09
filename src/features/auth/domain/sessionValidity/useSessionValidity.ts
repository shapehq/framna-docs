"use client"

import useSWR from "swr"
import { fetcher } from "../../../../common"
import SessionValidity from "./SessionValidity"

type SessionValidityContainer = { sessionValidity: SessionValidity }

export default function useSessionValidity() {
  const { data, error, isLoading } = useSWR<SessionValidityContainer, Error>(
    "/api/user/session-validity",
    fetcher
  )
  return {
    sessionValidity: data?.sessionValidity || SessionValidity.VALID,
    isLoading,
    error
  }
}
