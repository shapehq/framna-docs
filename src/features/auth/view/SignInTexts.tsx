"use client"

import { BASE_COLORS } from "@/common/theme/theme"
import { Box, Typography, SxProps } from "@mui/material"
import { useEffect, useState, useMemo } from "react"

const SignInTexts = ({ prefix }: { prefix: string }) => {
  const getRandomTextColor = ({ excluding }: { excluding?: string }) => {
    const colors = BASE_COLORS
      .filter(e => e !== excluding)
    return colors[Math.floor(Math.random() * colors.length)]
  }
  const [characterIndex, setCharacterIndex] = useState(0)
  const [textIndex, setTextIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [textColor, setTextColor] = useState(getRandomTextColor({}))
  const texts = useMemo(() => [
    "is a great OpenAPI viewer",
    "facilitates spec-driven development",
    "puts your documentation in one place",
    "adds documentation previews to pull requests"
  ], [])
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedText("")
      setCharacterIndex(0)
      setTextColor(getRandomTextColor({ excluding: textColor }))
      setTextIndex((prevIndex) => (prevIndex + 1) % texts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [texts.length, textColor])
  useEffect(() => {
    const interval = setInterval(() => {
      setCharacterIndex(characterIndex + 1)
      setDisplayedText(texts[textIndex].substring(0, characterIndex))
      if (characterIndex === texts[textIndex].length) {
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [texts, textIndex, characterIndex])
  const longestText = texts.reduce((a, b) => (a.length > b.length ? a : b))
  return (
    <>
      <Box sx={{ position: "relative" }}>
        <Text prefix={prefix} text={longestText} sx={{ visibility: "hidden" }} />
        <Text
          prefix={prefix}
          text={displayedText}
          textColor={textColor}
          sx={{ position: "absolute", top: 0, left: 0, right: 0 }}
        >
          <Box component="span" sx={{
            borderRight: `2px solid #fff`,
            animation: "blink 1s step-end infinite"
          }}>
            &nbsp;
          </Box>
        </Text>
        <style jsx>{`
          @keyframes blink {
            0%, 100% { border-color: transparent; }
            50% { border-color: #fff; }
          }
        `}</style>
      </Box>
    </>
  )
}

export default SignInTexts

const Text = ({ 
  prefix,
  text,
  textColor,
  children,
  sx
}: {
  prefix: string,
  text: string,
  textColor?: string,
  children?: React.ReactNode,
  sx?: SxProps
}) => {
  return (
    <Typography variant="h4" sx={{
      ...sx,
      paddingLeft: { md: 5, lg: 10 },
      paddingRight: { md: 5, lg: 10 }
    }}>
      {prefix} <span style={{ color: textColor }}>{text}</span>
      {children}
    </Typography>
  )
}
