"use client"

import { SWRConfig } from "swr"
import { FetcherError } from "@/common/utils/fetcher"

export default function ErrorHandler({
  children
}: {
  children: React.ReactNode
}) {
  const onSWRError = (error: FetcherError) => {
    if (error.status == 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/api/auth/logout"
      }
    }
  }
  return (
    <SWRConfig value={{ onError: onSWRError }}>
      {children}
    </SWRConfig>
  )
}
