"use client"
import React from "react"
import { SxProps, Typography, TypographyVariant } from "@mui/material"
import styled from "@emotion/styled"

interface HighlightTextProps {
  content: string
  highlight: string
  color: string
  height?: string
  isSolidOpacity?: boolean
  isBoldText?: boolean
  variant?: TypographyVariant
  sx?: SxProps
}

const HighlightSpan = styled.span<{
    color: string; isSolidOpacity: boolean; height: string; isBoldText: boolean 
  }>`
  position: relative;
  display: inline-block;
  ${({ isBoldText }) => isBoldText && "font-weight: 600"};
  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    height: ${({ height }) => height};
    width: 105%;
    background-color: ${({ color }) => color};
    z-index: -10;
    opacity: ${({ isSolidOpacity }) => isSolidOpacity ? .7 : .3};
    transform: scaleX(1);
  }
}`;

const HighlightText = ({
  content,
  highlight,
  color,
  height="50%",
  isSolidOpacity=false,
  isBoldText=false,
  variant,
  sx
}: HighlightTextProps) => {
  const parts = content.split(new RegExp(`(${highlight})`, 'gi'))

  return (
    <Typography
      variant={variant}
      sx={{
        ...sx,
        display: { xs: "box", sm: "box", md: "flex" },
        gap: 1,
      }}
    >
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <HighlightSpan
            key={`highlight-span-${index}`}
            color={color}
            isSolidOpacity={isSolidOpacity}
            height={height}
            isBoldText={isBoldText}>
            {part}
          </HighlightSpan>
        ) : (
          part
        )
      )}
    </Typography>
  );
};

export default HighlightText;
