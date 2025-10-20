"use client";

import React from "react";
import { Box } from "@mui/material";


const MonoQuotedText = ({ text }: { text: string }) => {
  return (
    <>
      {text.split(/(['`])([^'`]+)\1/g).map((part, i) =>
        i % 3 === 2 ? (
          <Box
            key={i}
            component="span"
            sx={{
              fontFamily: "Segoe UI Mono, monospace",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </>
  );
};

export default MonoQuotedText;
