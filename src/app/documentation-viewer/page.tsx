import DocumentationViewer from "@/features/docs/view/DocumentationViewer"

type SearchParams = { visualizer: string, url: string }

export default async function Page({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const { visualizer, url } = await searchParams
  return (
    <DocumentationViewer
      visualizer={parseInt(visualizer)}
      url={url}
    />
  )
}