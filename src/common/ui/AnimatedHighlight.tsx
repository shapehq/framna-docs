"use client"
import React from "react"
import { SxProps, Typography, TypographyVariant } from "@mui/material"
import styled from "@emotion/styled"

interface AnimatedHighlightProps {
  content: string
  highlight: string
  color: string
  waitForHover: boolean
  variant?: TypographyVariant
  sx?: SxProps
}

const HighlightSpan = styled.span<{ color: string; waitForHover: boolean }>`
  position: relative;
  display: inline-block;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    height: 50%;
    width: 105%;
    background-color: ${({ color }) => color};
    transition: transform 0.5s ease, opacity 0.5s ease;
    transform-origin: right;
    transform: scaleX(0);
    z-index: -10;
    opacity: ${({ waitForHover }) => (waitForHover ? .2 : .7)};
    ${({ waitForHover }) => !waitForHover && `transform: scaleX(1);`}
  }
  &:hover::before {
    ${({ waitForHover }) =>
      waitForHover &&
      `
      transform: scaleX(1);
      opacity: .7;
    `}
  }
`;

const AnimatedHighlight = ({
  content,
  highlight,
  color,
  waitForHover,
  variant,
  sx
}: AnimatedHighlightProps) => {
  const parts = content.split(new RegExp(`(${highlight})`, 'gi'))

  return (
    <Typography
      variant={variant}
      sx={{
        ...sx,
        display: { xs: "none", sm: "none", md: "flex" },
        gap: 1,
      }}
    >
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <HighlightSpan key={index} color={color} waitForHover={waitForHover}>
            {part}
          </HighlightSpan>
        ) : (
          part
        )
      )}
    </Typography>
  );
};

export default AnimatedHighlight;
