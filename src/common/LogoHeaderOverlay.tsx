import Image from "next/image"
import { Box } from "@mui/material"
import ShapeLogo from "../../public/shape2023.svg"

const LogoHeaderOverlay: React.FC = () => {
  return (
    <Box
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        zIndex: -1000
      }}
    >
      <Image src={ShapeLogo} alt="Shape logo" />
    </Box>
  )
}

export default LogoHeaderOverlay
