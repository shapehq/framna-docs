import { useState, useEffect } from "react"
import { useProjectSelection } from "@/features/projects/data"
import { DiffChange } from "../../diff/domain/DiffChange"

interface DiffData {
  changes: DiffChange[]
  error?: string | null
  isNewFile?: boolean
}

export default function useDiff() {
  const { specification } = useProjectSelection()
  const [data, setData] = useState<DiffData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const diffUrl = specification?.diffURL

  useEffect(() => {
    if (!diffUrl) {
      return
    }

    let isCancelled = false

    const fetchDiff = async () => {
      if (isCancelled) {
        return
      }

      setLoading(true)
      setError(null)
      setData(null)

      try {
        const res = await fetch(diffUrl)
        const result = await res.json()

        if (isCancelled) {
          return
        }

        if (result.error) {
          setData(null)
          setError(result.error)
        } else {
          setData(result)
          setError(null)
        }
        setLoading(false)
      } catch (err) {
        if (isCancelled) {
          return
        }

        console.error("Failed to fetch diff:", err)
        setData(null)
        setError("We couldn't load the diff right now. Please try again later.")
        setLoading(false)
      }
    }

    fetchDiff()

    return () => {
      isCancelled = true
    }
  }, [diffUrl])

  const hasDiffUrl = Boolean(diffUrl)
  const resolvedData = hasDiffUrl ? data : { changes: [] }
  const resolvedChanges = resolvedData?.changes ?? []
  const resolvedLoading = hasDiffUrl ? loading : false
  const resolvedError = hasDiffUrl ? error : null
  const isNewFile = resolvedData?.isNewFile ?? false

  return {
    data: resolvedData,
    loading: resolvedLoading,
    changes: resolvedChanges,
    error: resolvedError,
    isNewFile
  }
}
