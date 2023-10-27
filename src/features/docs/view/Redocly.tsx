import { useState } from "react"
import { RedocStandalone } from "redoc"
import LoadingWrapper from "./LoadingWrapper"

const Redocly = ({ url }: { url: string }) => {
  const [isLoading, setLoading] = useState(true)
  return (
    <LoadingWrapper showLoadingIndicator={isLoading}>
      <RedocStandalone
        specUrl={url}
        options={{ hideLoading: true }}
        onLoaded={() => setLoading(false)}
      />
    </LoadingWrapper>
  )
}

export default Redocly
