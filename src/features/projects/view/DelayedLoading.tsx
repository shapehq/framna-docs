import { useState, useEffect } from "react"
import { Box, CircularProgress } from "@mui/material"

const DelayedLoading = () => {
  const [isVisible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [setVisible])
  return (
    <Box style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      width: "100%"
    }}>
      {isVisible &&
        <CircularProgress
          color="inherit"
          sx={{ opacity: 0.2 }}
        />  
      }
    </Box>
  )
}

export default DelayedLoading
