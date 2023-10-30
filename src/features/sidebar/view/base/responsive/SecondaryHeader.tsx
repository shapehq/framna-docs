import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Box, IconButton, Stack, Collapse } from "@mui/material"
import SecondaryHeader from "../SecondaryHeader"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"

export default function ResponsiveSecondaryHeader({
  isOpenSidebarEnabled,
  onOpenSidebar,
  showMobileToolbar,
  onToggleMobileToolbar,
  trailingItem,
  mobileToolbar,
  sx
}: {
  isOpenSidebarEnabled: boolean
  onOpenSidebar: () => void
  showMobileToolbar: boolean
  onToggleMobileToolbar: (showMobileToolbar: boolean) => void
  trailingItem?: ReactNode
  mobileToolbar?: ReactNode
  sx?: SxProps
}) {
  return (
    <SecondaryHeader
      sx={sx}
      isOpenSidebarEnabled={isOpenSidebarEnabled}
      onOpenSidebar={onOpenSidebar}
      trailingItem={
        <Stack direction="row" alignItems="center">
          {trailingItem}
          {mobileToolbar &&
            <IconButton
              color="primary"
              edge="end"
              onClick={() => onToggleMobileToolbar(!showMobileToolbar) }
              sx={{ display: { sm: "flex", md: "none" } }}
            >
              <FontAwesomeIcon
                icon={faChevronDown}
                size="2xs"
                style={{
                  aspectRatio: 1,
                  padding: 2,
                  transform: showMobileToolbar ? "rotate(180deg)" : "none"
                }}
              />
            </IconButton>
          }
        </Stack>
      }
    >
      {mobileToolbar &&
        <Collapse in={showMobileToolbar} >
          <Box sx={{
            padding: 2,
            paddingTop: 0,
            display: { sm: "block", md: "none" }
          }}>
            {mobileToolbar}
          </Box>
        </Collapse>
      }
    </SecondaryHeader>
  )
}
