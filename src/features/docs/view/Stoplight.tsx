import { API } from "@stoplight/elements"
import "@stoplight/elements/styles.min.css"

const Stoplight = ({ url }: { url: string }) => {
  return <API apiDescriptionUrl={url} router="hash" />
}

export default Stoplight
