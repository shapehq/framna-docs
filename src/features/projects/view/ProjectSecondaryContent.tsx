import ProjectSelection, { ProjectSelectionState } from "../domain/ProjectSelection"
import DocumentationViewer from "./docs/DocumentationViewer"
import ProjectErrorContent from "./ProjectErrorContent"

export default function ProjectSecondaryContent(
  { projectSelection }: { projectSelection: ProjectSelection }
) {
  switch (projectSelection.state) {
  case ProjectSelectionState.LOADING:
  case ProjectSelectionState.NO_PROJECT_SELECTED:
    return <></>
  case ProjectSelectionState.HAS_SELECTION:
    return <DocumentationViewer url={projectSelection.selection!.specification.url}/>
  case ProjectSelectionState.PROJECT_NOT_FOUND:
    return <ProjectErrorContent text="The project was not found."/>
  case ProjectSelectionState.VERSION_NOT_FOUND:
    return <ProjectErrorContent text="The selected branch or tag was not found."/>
  case ProjectSelectionState.SPECIFICATION_NOT_FOUND:
    return <ProjectErrorContent text="The selected specification was not found."/>
  }
}
