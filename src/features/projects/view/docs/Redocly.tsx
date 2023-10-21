import { RedocStandalone } from "redoc"

const Redocly = ({ url }: { url: string }) => {
  return <RedocStandalone specUrl={url} />
}

export default Redocly
