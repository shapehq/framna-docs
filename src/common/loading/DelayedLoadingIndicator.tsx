import { useState, useEffect } from "react"
import LoadingIndicator from "./LoadingIndicator"

const DelayedLoadingIndicator = () => {
  const [isVisible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [setVisible])
  return <>{isVisible && <LoadingIndicator/>}</>
}

export default DelayedLoadingIndicator
