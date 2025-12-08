"use client"

import React from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material"
import { softPaperSx } from "@/common/theme/theme"
import MonoQuotedText from "./MonoQuotedText"

type Level = 1 | 2 | 3

const getLevelConfig = (level: Level) => {
  switch (level) {
    case 3:
      return { label: "breaking", color: "#e88388" }
    case 2:
      return { label: "warn", color: "#dbab79" }
    case 1:
    default:
      return { label: "info", color: "#66c2cd" }
  }
}

interface ChangeDetails {
  path?: string
  text?: string | React.ReactNode
  level?: number
  operation?: string
}

const DiffDialog = ({
  open,
  change,
  onClose,
}: {
  open: boolean
  change: ChangeDetails | null
  onClose: () => void
}) => {
  const levelConfig = getLevelConfig((change?.level ?? 1) as Level)

  return (
    <Dialog
      open={!!open}
      onClose={onClose}
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            ...softPaperSx,
            backgroundColor: (theme) => theme.palette.background.default,
          },
        },
      }}
    >
      <DialogTitle>Change Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography
              component="span"
              sx={{
                fontFamily: "Segoe UI Mono, monospace",
                fontWeight: 700,
                fontSize: "0.85rem",
                color: levelConfig.color,
                textTransform: "lowercase",
              }}
            >
              {levelConfig.label}
            </Typography>
            {change?.operation && change?.path && (
              <Typography
                component="span"
                sx={{
                  fontFamily: "Segoe UI Mono, monospace",
                  fontSize: "0.85rem",
                  color: "text.secondary",
                }}
              >
                at{" "}
                <Box
                  component="span"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {change.operation}
                </Box>{" "}
                <Box component="span" sx={{ wordBreak: "break-word" }}>
                  {change.path}
                </Box>
              </Typography>
            )}
            {!change?.operation && change?.path && (
              <Typography
                component="span"
                sx={{
                  fontFamily: "Segoe UI Mono, monospace",
                  fontSize: "0.85rem",
                  color: "text.secondary",
                  wordBreak: "break-word",
                }}
              >
                {change.path}
              </Typography>
            )}
          </Box>
        </Box>
        {change?.text && (
          <Box>
            <Typography variant="body0" sx={{ wordBreak: "break-word" }}>
              {typeof change.text === "string" ? (
                <MonoQuotedText text={change.text} />
              ) : (
                change.text
              )}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default DiffDialog
