import { Box, Typography } from "@mui/material"

const ProjectErrorContent = ({ text }: { text: string }) => {
  return (
    <Box style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
      position: "fixed",
      top: "0",
      left: "0"
    }}>
      <Typography>
        {text}
      </Typography>
    </Box>
  )
}

export default ProjectErrorContent
