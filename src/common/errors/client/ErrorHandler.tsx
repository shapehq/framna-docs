"use client"

import { SWRConfig } from "swr"
import { FetcherError } from "@/common"

export default function ErrorHandler({
  children
}: {
  children: React.ReactNode
}) {
  const onSWRError = (error: FetcherError) => {
    if (typeof window === "undefined") {
      return
    }
    if (error.status == 401) {
      window.location.href = "/api/auth/logout"
    } else if (error.status == 403) {
      window.location.href = "/invalid-session"
    }
  }
  return (
    <SWRConfig value={{ onError: onSWRError }}>
      {children}
    </SWRConfig>
  )
}
