"use client"

import { Box, Typography } from "@mui/material"
import PopulatedDiffList from "./PopulatedDiffList"
import { DiffChange } from "@/features/diff/domain/DiffChange"

export type DiffListStatus = "idle" | "loading" | "empty" | "ready" | "error"

const DiffList = ({
  changes,
  status,
  onClick,
}: {
  changes: DiffChange[]
  status: DiffListStatus
  onClick: (change: DiffChange) => void
}) => {
  if (status === "loading") {
    return (
      <Box sx={{ textAlign: "left", py: 1, px: 1 }}>
        <Typography variant="body0" color="text.secondary">
          Loading changes...
        </Typography>
      </Box>
    )
  } else if (status === "empty") {
    return (
      <Box sx={{ textAlign: "left", py: 1, px: 1 }}>
        <Typography variant="body0" color="text.secondary">
          No changes
        </Typography>
      </Box>
    )
  } else if (status === "ready") {
    return (
      <PopulatedDiffList
        changes={changes}
        onClick={onClick}
      />
    )
  }

  return null
}

export default DiffList
