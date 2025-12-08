"use client"

import { Box, Typography, ListItem, ListItemButton, Stack } from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"
import MonoQuotedText from "./MonoQuotedText"
import { getLevelConfig, Level } from "./levelConfig"

const DiffListItem = ({
  path,
  text,
  level,
  operation,
  selected,
  onClick,
}: {
  path?: string
  text?: string
  level?: number
  operation?: string
  selected: boolean
  onClick: () => void
}) => {
  const levelConfig = getLevelConfig((level ?? 1) as Level)

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
                gap: 0.75,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  component="span"
                  sx={{
                    fontFamily: "Segoe UI Mono, monospace",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: levelConfig.color,
                    textTransform: "lowercase",
                  }}
                >
                  {levelConfig.label}
                </Typography>
                {operation && path && (
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: "Segoe UI Mono, monospace",
                      fontSize: "0.8rem",
                      color: "text.secondary",
                    }}
                  >
                    at{" "}
                    <Box
                      component="span"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      {operation}
                    </Box>{" "}
                    <Box component="span" sx={{ wordBreak: "break-word" }}>
                      {path}
                    </Box>
                  </Typography>
                )}
                {!operation && path && (
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: "Segoe UI Mono, monospace",
                      fontSize: "0.8rem",
                      color: "text.secondary",
                      wordBreak: "break-word",
                    }}
                  >
                    {path}
                  </Typography>
                )}
              </Box>
              {text && (
                <Typography
                  variant="body0"
                  sx={{ wordBreak: "break-word", pl: 0.5 }}
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
