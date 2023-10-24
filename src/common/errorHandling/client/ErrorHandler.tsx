"use client"

import { SWRConfig } from "swr"

export default function ErrorHandler({
  children
}: {
  children: React.ReactNode
}) {
  const onSWRError = (error: any) => {
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
