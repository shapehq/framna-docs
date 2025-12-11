"use client"

import { Alert, Box, Typography, Link } from "@mui/material"
import useDiff from "@/features/sidebar/data/useDiff"
import { useProjectSelection } from "@/features/projects/data"
import useDocumentationVisualizer from "@/features/settings/data/useDocumentationVisualizer"
import { scrollToOperation } from "@/features/docs/navigation"
import DiffList, { DiffListStatus } from "./components/DiffList"
import { DiffChange } from "@/features/diff/domain/DiffChange"

const DiffContent = () => {
  const { data, loading, changes, error, isNewFile } = useDiff()
  const { specification } = useProjectSelection()
  const [visualizer] = useDocumentationVisualizer()

  const handleChangeClick = (change: DiffChange) => {
    scrollToOperation(visualizer, change.operationId, change.operation, change.path)
  }

  const hasData = Boolean(data)
  const hasChanges = changes.length > 0
  const diffStatus: DiffListStatus = loading
    ? "loading"
    : error
      ? "error"
      : isNewFile
        ? "empty"
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

      {specification?.diffBaseBranch && specification?.diffBaseOid && (
        <Typography variant="caption" color="text.secondary" sx={{ px: 1, pb: 1 }}>
          Comparing to:{" "}
          {specification.diffPrUrl ? (
            <Link
              href={specification.diffPrUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="caption"
              color="text.secondary"
              underline="hover"
            >
              {specification.diffBaseBranch} ({specification.diffBaseOid.substring(0, 7)})
            </Link>
          ) : (
            `${specification.diffBaseBranch} (${specification.diffBaseOid.substring(0, 7)})`
          )}
        </Typography>
      )}

      {isNewFile && (
        <Box sx={{ textAlign: "left", py: 1, px: 1 }}>
          <Typography variant="body0" color="text.secondary">
            This is a new file that doesn&apos;t exist on the base branch.
          </Typography>
        </Box>
      )}

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

      {!isNewFile && (
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
            onClick={handleChangeClick}
          />
        </Box>
      )}
    </Box>
  )
}

export default DiffContent
