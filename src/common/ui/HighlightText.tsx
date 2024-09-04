"use client"
import React from "react"
import { SxProps, Typography, TypographyVariant } from "@mui/material"
import styled from "@emotion/styled"

type CustomTypographyVariant = TypographyVariant | 'body0' | 'body3';

interface HighlightTextProps {
  content: string
  highlight: string[]
  variant?: CustomTypographyVariant
  sx?: SxProps
}

const HighlightSpan = styled.span`
  position: relative;
  display: inline-block;
  font-weight: 600;
}`

const HighlightText = ({
  content,
  highlight,
  variant,
  sx
}: HighlightTextProps) => {
  if (!highlight.length) {
    return (
      <Typography variant={variant} sx={{ ...sx }}>
        {content}
      </Typography>
    )
  }
  const parts = content.split(new RegExp(`(${highlight.join('|')})`, 'gi'))
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
        const highlightIndex = highlight.findIndex(h => h.toLowerCase() === part.toLowerCase())
        return highlightIndex !== -1 ? (
          <HighlightSpan key={`highlight-span-${index}`}>
            {part}
          </HighlightSpan>
        ) : (
          part
        )
      })}
    </Typography>
  )
}

export default HighlightText
