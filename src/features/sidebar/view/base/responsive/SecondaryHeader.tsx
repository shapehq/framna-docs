import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Box, Divider, IconButton, Stack, Collapse } from "@mui/material"
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
        <Stack direction="row" alignItems="center" spacing={1}>
          {trailingItem}
          <Box sx={{ display: { sm: mobileToolbar ? "block" : "none", md: "none" } }}>
            <IconButton edge="end" onClick={() => onToggleMobileToolbar(!showMobileToolbar) }>
              <ExpandCircleDownIcon sx={{
                transform: showMobileToolbar ? "rotate(180deg)" : "none" }}
              />
            </IconButton>
          </Box>
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
