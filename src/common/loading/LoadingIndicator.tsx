import { useState, useEffect } from "react" 
import { Box, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"

const LoadingIndicator = () => {
  const theme = useTheme()
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
      width: "100%",
      background: theme.palette.background.default
    }}>
      {Array.from(Array(3).keys()).map((e) => {
        return (
          <Typography variant="h3" sx={{ opacity: e + 1 == count ? 0.5 : 0.2 }}>
            •
          </Typography>
        )
      })}
    </Box>
  )
}

export default LoadingIndicator