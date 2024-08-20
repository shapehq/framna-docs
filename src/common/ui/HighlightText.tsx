"use client"
import React from "react"
import { SxProps, Typography, TypographyVariant } from "@mui/material"
import styled from "@emotion/styled"

type CustomTypographyVariant = TypographyVariant | 'body0' | 'body3';

interface HighlightTextProps {
  content: string
  highlight: string[]
  color: string[]
  height?: string
  opacity?: number
  isBoldText?: boolean
  variant?: CustomTypographyVariant
  sx?: SxProps
}

const HighlightSpan = styled.span<{
  color: string; opacity: number; height: string; isBoldText: boolean 
}>`
  position: relative;
  display: inline-block;
  ${({ isBoldText }) => isBoldText && "font-weight: 600"};
  &::before {
    content: '';
    position: absolute;
    left: -1%;
    bottom: 0;
    height: ${({ height }) => height};
    width: 102%;
    background-color: ${({ color }) => color};
    z-index: -10;
    opacity: ${({ opacity }) => opacity * 0.1};
    transform: skewX(-2deg);
  }
}`;

const HighlightText = ({
  content,
  highlight,
  color,
  height="50%",
  opacity=3,
  isBoldText=false,
  variant,
  sx
}: HighlightTextProps) => {
  if (!highlight.length || !color.length) {
    return (
      <Typography variant={variant} sx={{ ...sx }}>
        {content}
      </Typography>
    );
  }

  const parts = content.split(new RegExp(`(${highlight.join('|')})`, 'gi'));
  const getColor = (index: number) => color[index % color.length];

  return (
    <Typography
      variant={variant}
      sx={{
        ...sx,
        display: "inline",
        gap: 1,
      }}
    >
      {parts.map((part, index) => {
        const highlightIndex = highlight.findIndex(h => h.toLowerCase() === part.toLowerCase());
        return highlightIndex !== -1 ? (
          <HighlightSpan
            key={`highlight-span-${index}`}
            color={getColor(highlightIndex)}
            opacity={opacity}
            height={height}
            isBoldText={isBoldText}>
            {part}
          </HighlightSpan>
        ) : (
          part
        )
      })}
    </Typography>
  );
};

export default HighlightText;
