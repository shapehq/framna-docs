import { useEffect, useState } from "react"
import { API } from "@stoplight/elements"
import "@stoplight/elements/styles.min.css"
import LoadingWrapper from "./LoadingWrapper"

const Swagger = ({ url }: { url: string }) => {
  // The Stoplight component does not provide a callback to let us know
  // when loading ends so in order to show our loading indicator, we load
  // the specification before showing the Stoplight component.
  const [document, setDocument] = useState<string | undefined>(undefined)
  const [isLoading, setLoading] = useState(true)
  useEffect(() => {
    fetch(url)
      .then(res => res.text())
      .then(data => {
        setDocument(data)
        setLoading(false)
      })
  }, [url])
  return (
    <LoadingWrapper showLoadingIndicator={isLoading}>
      {!isLoading && document &&
        <API apiDescriptionDocument={document} router="hash" />
      }
    </LoadingWrapper>
  )
}

export default Swagger
