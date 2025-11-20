import { useState, useEffect } from "react"
import { useProjectSelection } from "@/features/projects/data"
import { DiffChange } from "../../diff/domain/DiffChange"

interface DiffData {
  from: string
  to: string
  changes: DiffChange[]
  error?: string | null
}

export default function useDiff() {
  const { specification } = useProjectSelection()
  const [data, setData] = useState<DiffData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const diffUrl = specification?.diffURL

  useEffect(() => {
    if (!diffUrl) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    fetch(diffUrl)
      .then(res => res.json())
      .then(result => {
        if (result.error) {
          setData(null)
          setError(result.error)
        } else {
          setData(result)
          setError(null)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch diff:", err)
        setData(null)
        setError("We couldn't load the diff right now. Please try again later.")
        setLoading(false)
      })
  }, [diffUrl])

  return { data, loading, changes: data?.changes || [], error }
}
