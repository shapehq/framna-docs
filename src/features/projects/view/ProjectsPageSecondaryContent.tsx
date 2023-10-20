import { ProjectPageStateContainer, ProjectPageState } from "../domain/ProjectPageState"
import ProjectErrorContent from "./ProjectErrorContent"
import DocumentationViewer from "./docs/DocumentationViewer"

const ProjectsPageSecondaryContent = ({
  stateContainer
}: {
  stateContainer: ProjectPageStateContainer  
}) => {
  switch (stateContainer.state) {
  case ProjectPageState.LOADING:
  case ProjectPageState.NO_PROJECT_SELECTED:
    return <></>
  case ProjectPageState.ERROR:
    return <ProjectErrorContent text={stateContainer.error!.toString()}/>
  case ProjectPageState.HAS_SELECTION:
    return <DocumentationViewer url={stateContainer.selection!.specification.url}/>
  case ProjectPageState.PROJECT_NOT_FOUND:
    return <ProjectErrorContent text="The project was not found."/>
  case ProjectPageState.VERSION_NOT_FOUND:
    return <ProjectErrorContent text="The selected branch or tag was not found."/>
  case ProjectPageState.SPECIFICATION_NOT_FOUND:
    return <ProjectErrorContent text="The selected specification was not found."/>
  }
}

export default ProjectsPageSecondaryContent