import { ReactNode } from "react"
import Image from "next/image"
import { Box, Stack } from "@mui/material"
import ClientSidebarContainer from "./client/SidebarContainer"
import SidebarContent from "./SidebarContent"

interface SidebarContainerProps {
  readonly primary: ReactNode
  readonly secondary: ReactNode
  readonly toolbarTrailing?: ReactNode
}

const SidebarContainer: React.FC<SidebarContainerProps> = ({
  primary,
  secondary,
  toolbarTrailing
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
      secondaryHeader={
        <>
          {toolbarTrailing != undefined && 
            <Box sx={{ 
              display: "flex",
              width: "100%",
              justifyContent: "right"
            }}>
              {toolbarTrailing}
            </Box>
          }
        </>
      }
      secondary={secondary}
    />
  )
}

export default SidebarContainer
