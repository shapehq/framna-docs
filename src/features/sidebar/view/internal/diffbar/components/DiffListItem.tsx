"use client"

import { Box, Typography, ListItem, ListItemButton, Stack } from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"
import MonoQuotedText from "./MonoQuotedText"

const DiffListItem = ({
  path,
  text,
  selected,
  onClick,
}: {
  path?: string
  text?: string
  selected: boolean
  onClick: () => void
}) => {
  return (
    <ListItem disableGutters disablePadding>
      <ListItemButton
        selected={selected}
        onClick={onClick}
        disableGutters
        sx={{ width: "100%", px: 0, alignItems: "flex-start" }}
      >
        <MenuItemHover>
          <Stack direction="row" alignItems="center" sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                flex: 1,
                gap: 1.25,
              }}
            >
              {path && (
                <Typography
                  variant="body0"
                  sx={{
                    fontFamily: "Segoe UI Mono, monospace",
                    fontWeight: 700,
                    letterSpacing: 0.1,
                    wordBreak: "break-word",
                  }}
                >
                  {path}
                </Typography>
              )}
              {text && (
                <Typography
                  variant="body0"
                  sx={{ wordBreak: "break-word" }}
                >
                  <MonoQuotedText text={text} />
                </Typography>
              )}
            </Box>
          </Stack>
        </MenuItemHover>
      </ListItemButton>
    </ListItem>
  )
}

export default DiffListItem
