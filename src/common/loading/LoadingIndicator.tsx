import { Box, CircularProgress } from "@mui/material"

const LoadingIndicator = () => {
 return (
    <Box style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      width: "100%"
    }}>
      <CircularProgress
        color="inherit"
        sx={{ opacity: 0.2 }}
      />
    </Box>
  )
}

export default LoadingIndicator
