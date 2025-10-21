"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { softPaperSx } from "@/common/theme/theme";
import MonoQuotedText from "./MonoQuotedText";

interface ChangeDetails {
  path?: string;
  text?: string | React.ReactNode;
}

const DiffDialog = ({
  open,
  change,
  onClose,
}: {
  open: boolean;
  change: ChangeDetails | null;
  onClose: () => void;
}) => {
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
        {change?.path && (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ mb: 1, fontWeight: 600 }}>Path:</Typography>
            <Typography
              variant="body0"
              sx={{
                p: 1,
                fontFamily: "Segoe UI Mono, monospace",
                fontWeight: 700,
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              {change.path}
            </Typography>
          </Box>
        )}
        {change?.text && (
          <Box>
            <Typography sx={{ mb: 1, fontWeight: 600 }}>
              Description:
            </Typography>
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
  );
};

export default DiffDialog;
