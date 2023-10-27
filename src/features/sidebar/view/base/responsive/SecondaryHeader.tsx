import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Box, IconButton, Stack, Collapse } from "@mui/material"
import SecondaryHeader from "../SecondaryHeader"
import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDown"

export default function ResponsiveSecondaryHeader({
  showOpenDrawer,
  onOpenDrawer,
  showMobileToolbar,
  onToggleMobileToolbar,
  trailingItem,
  mobileToolbar,
  sx
}: {
  showOpenDrawer: boolean
  onOpenDrawer: () => void
  showMobileToolbar: boolean
  onToggleMobileToolbar: (showMobileToolbar: boolean) => void
  trailingItem?: ReactNode
  mobileToolbar?: ReactNode
  sx?: SxProps
}) {
  return (
    <SecondaryHeader
      sx={sx}
      showOpenDrawer={showOpenDrawer}
      onOpenDrawer={onOpenDrawer}
      trailingItem={
        <Stack direction="row" alignItems="center">
          {trailingItem}
          {mobileToolbar &&
            <IconButton edge="end" onClick={() => onToggleMobileToolbar(!showMobileToolbar) }>
              <ExpandCircleDownIcon sx={{
                transform: showMobileToolbar ? "rotate(180deg)" : "none" }}
              />
            </IconButton>
          }
        </Stack>
      }
    >
      {mobileToolbar &&
        <Collapse in={showMobileToolbar} >
          <Box sx={{ padding: 2, paddingTop: 0, display: { sm: "block", md: "none" } }}>
            {mobileToolbar}
          </Box>
        </Collapse>
      }
    </SecondaryHeader>
  )
}
