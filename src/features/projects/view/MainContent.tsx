import Project from "../domain/Project"
import Version from "../domain/Version"
import OpenApiSpecification from "../domain/OpenApiSpecification"
import ProjectErrorContent from "./ProjectErrorContent"
import DocumentationViewer from "./docs/DocumentationViewer"

const MainContent = ({
  isLoading,
  error,
  project,
  version,
  specification
}: {
  isLoading: boolean,
  error?: Error,
  project?: Project,
  version?: Version,
  specification?: OpenApiSpecification  
}) => {
  if (project && version && specification) {
    return <DocumentationViewer url={specification.url}/>
  } else if (isLoading) {
    return <></>
  } else if (error) {
    return <ProjectErrorContent text={error.message}/>
  } else if (!project) {
    return <ProjectErrorContent text="The project was not found."/>
  } else if (!version) {
    return <ProjectErrorContent text="The selected branch or tag was not found."/>
  } else {
    return <ProjectErrorContent text="The selected specification was not found."/>
  }
}

export default MainContent