"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import PopulatedDiffList from "./PopulatedDiffList";

const DiffList = ({
  changes,
  loading,
  data,
  selectedChange,
  onClick,
}: {
  changes: any[];
  loading: boolean;
  data: boolean;
  selectedChange: number | null;
  onClick: (i: number) => void;
}) => {
  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body0" color="text.secondary">
          Loading changes...
        </Typography>
      </Box>
    );
  } else if (!loading && data && changes.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body0" color="text.secondary">
          Non comparable
        </Typography>
      </Box>
    );
  }

  return (
    <PopulatedDiffList
      changes={changes}
      selectedChange={selectedChange}
      onClick={onClick}
    />
  );
};

export default DiffList;
