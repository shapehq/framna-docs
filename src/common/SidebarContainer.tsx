import { ReactNode } from "react"
import ClientSidebarContainer from "./client/SidebarContainer"
import SidebarContent from "./SidebarContent"

interface SidebarContainerProps {
  readonly primary: ReactNode
  readonly secondary: ReactNode
}

const SidebarContainer: React.FC<SidebarContainerProps> = ({
  primary,
  secondary
}) => {
  return (
    <ClientSidebarContainer
      primaryHeader={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Image src="/duck.png" alt="Duck" width={40} height={45}/>
        </Stack>
      }
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
