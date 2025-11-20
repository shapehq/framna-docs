"use client"

import { Alert, Box, Typography } from "@mui/material"
import { useState } from "react"
import useDiff from "@/features/sidebar/data/useDiff"
import DiffList, { DiffListStatus } from "./components/DiffList"
import DiffDialog from "./components/DiffDialog"

const DiffContent = () => {
  const { data, loading, changes, error } = useDiff()
  const [selectedChange, setSelectedChange] = useState<number | null>(null)

  const closeModal = () => setSelectedChange(null)

  const hasData = Boolean(data)
  const hasChanges = changes.length > 0
  const diffStatus: DiffListStatus = loading
    ? "loading"
    : error
      ? "error"
      : hasData && hasChanges
        ? "ready"
        : hasData
          ? "empty"
          : "idle"

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        px: 1,
        py: 4,
        gap: 1,
      }}
    >
      <Typography variant="body2" sx={{ px: 1 }}>
        What has changed?
      </Typography>

      {error ? (
        <Alert
          severity="error"
          icon="!"
          variant="outlined"
          sx={{
            my: 1,
            mx: 1,
            py: 0.5,
            "& .MuiAlert-message": {
              fontSize: "0.85rem",
              lineHeight: 1.4,
            },
          }}
        >
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <DiffList
          changes={changes}
          status={diffStatus}
          selectedChange={selectedChange}
          onClick={(i) => setSelectedChange(i)}
        />
      </Box>

      <DiffDialog
        open={selectedChange !== null}
        change={selectedChange !== null ? changes[selectedChange] : null}
        onClose={closeModal}
      />
    </Box>
  )
}

export default DiffContent
