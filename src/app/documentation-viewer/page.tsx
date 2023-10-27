import DocumentationViewer from "@/features/docs/view/DocumentationViewer"

type SearchParams = { visualizer: string, url: string }

export default async function Page({
  searchParams
}: {
  searchParams: SearchParams
}) {
  return (
    <DocumentationViewer
      visualizer={parseInt(searchParams.visualizer)}
      url={searchParams.url}
    />
  )
}