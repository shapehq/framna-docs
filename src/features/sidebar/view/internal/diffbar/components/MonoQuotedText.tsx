"use client";

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
        ) : i % 3 === 1 ? null : (
          part
        )
      )}
    </>
  );
};

export default MonoQuotedText;
