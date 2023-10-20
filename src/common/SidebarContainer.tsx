import dynamic from "next/dynamic"
import { ReactNode } from "react"
import Image from "next/image"
import { Box, Stack } from "@mui/material"
import { useSessionStorage } from "usehooks-ts"
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
  const [open, setOpen] = useSessionStorage("isDrawerOpen", true)
  return (
    <ClientSidebarContainer
      isDrawerOpen={open}
      onToggleDrawerOpen={setOpen}
      primaryHeader={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Image src="/duck.png" alt="Duck" width={40} height={45} priority={true}/>
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

// Disable server-side rendering as this component uses the window instance to manage its state.
export default dynamic(() => Promise.resolve(SidebarContainer), {
  ssr: false
})
