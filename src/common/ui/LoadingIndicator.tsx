"use client"

import { useState, useEffect } from "react" 
import { Box, Typography } from "@mui/material"

const LoadingIndicator = () => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      if (count == 3) {
        setCount(0)
      } else {
        setCount(count + 1)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [count, setCount])
  return (
    <Box style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      width: "100%"
    }}>
      {Array.from(Array(3).keys()).map((e) => {
        return (
          <Typography
            key={e}
            variant="h3"
            sx={{ opacity: e + 1 == count ? 0.5 : 0.2 }}
          >
            •
          </Typography>
        )
      })}
    </Box>
  )
}

export default LoadingIndicator