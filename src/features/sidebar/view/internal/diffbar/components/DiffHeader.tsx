"use client";

import React from "react";
import { Box, Typography, FormControl, Select, MenuItem } from "@mui/material";

interface Version {  
  id: string;  
  name: string;  
}  


const DiffHeader = ({
  versions,
  fromBranch,
  onChange,
}: {
  versions: Version[];
  fromBranch: string;
  onChange: (ref: string) => void;
}) => {
  return (
    <Box sx={{ paddingBottom: 1 }}>
      <FormControl sx={{ display: "flex", mb: 0, mt: 3.5, pr: 2 }} size="small">
        <Typography variant="body0" sx={{ mb: 2 }}>
          Added changes from main:
        </Typography>
        <Select value={fromBranch} onChange={(e) => onChange(e.target.value)}>
          {versions.map((v: any) => (
            <MenuItem key={v.id} value={v.id}>
              {v.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default DiffHeader;
