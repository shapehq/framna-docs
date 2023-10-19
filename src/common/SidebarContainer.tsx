import { ReactNode } from "react"
import ClientSidebarContainer from "./client/SidebarContainer"
import SidebarContent from "./SidebarContent"
import LogoHeaderOverlay from "./LogoHeaderOverlay"

interface SidebarContainerProps {
  readonly primaryHeader: ReactNode
  readonly primary: ReactNode
  readonly secondary: ReactNode
}

const SidebarContainer: React.FC<SidebarContainerProps> = ({
  primaryHeader,
  primary,
  secondary
}) => {
  return (
    <ClientSidebarContainer
      primaryHeader={primaryHeader}
      primary={
        <SidebarContent>
          {primary}
        </SidebarContent>
      }
      secondaryHeader={<LogoHeaderOverlay/>}
      secondary={secondary}
    />
  )
}

export default SidebarContainer
