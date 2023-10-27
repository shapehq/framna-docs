import { ReactNode } from "react"
import { Box } from "@mui/material"
import LoadingIndicator from "@/common/loading/LoadingIndicator"

const LoadingWrapper = ({
  showLoadingIndicator,
  children
}: {
  showLoadingIndicator: boolean,
  children: ReactNode
}) => {
  return (
    <Box sx={{
      width: "100%",
      height: "100%",
      position: "relative",
      overflowY: showLoadingIndicator ? "scroll" : "auto"
    }}>
      {showLoadingIndicator &&
        <Box sx={{ width: "100%", height: "100%", position: "absolute" }}>
          <LoadingIndicator/>
        </Box>
      }
      <Box sx={{
        width: "100%",
        height: "100%",
        position: "absolute",
        background: "white",
        opacity: showLoadingIndicator ? 0 : 1
      }}>
        {children}
      </Box>
    </Box>
  )
}

export default LoadingWrapper
