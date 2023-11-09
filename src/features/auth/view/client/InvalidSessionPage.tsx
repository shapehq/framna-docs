"use client"

import { ReactNode } from "react"
import { Stack, Typography } from "@mui/material"
import SidebarContainer from "@/features/sidebar/view/client/SidebarContainer"
import useSidebarOpen from "@/common/state/useSidebarOpen"

export default function InvalidSessionPage({
  title,
  children
}: {
  title?: ReactNode
  children?: ReactNode
}) {
  const [isSidebarOpen, setSidebarOpen] = useSidebarOpen()
  return (
    <SidebarContainer
      showHeader={true}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebarOpen={setSidebarOpen}
    >
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ width: "100%", height: "100%" }}
      >
        <Stack
          direction="column"
          spacing={1}
          alignItems="center"
          sx={{ margin: 2, maxWidth: "600px" }}
        >
          {title &&
            <Typography variant="h6" align="center">
              {title}
            </Typography>
          }
          <Typography align="center">
            {children}
          </Typography>
        </Stack>
      </Stack>
    </SidebarContainer>
  )
}
