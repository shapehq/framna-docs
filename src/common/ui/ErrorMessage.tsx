import { Box, Typography } from "@mui/material"

const ErrorMessage = ({ text }: { text: string }) => {
  return (
    <Box style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      width: "100%"
    }}>
      <Typography>
        {text}
      </Typography>
    </Box>
  )
}

export default ErrorMessage
