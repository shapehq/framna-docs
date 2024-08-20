import WelcomePage from "@/features/welcome"
import { Box } from "@mui/material"

const Page = () => {

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      height={1}
      width={1}
      gap={10}
    >
      <WelcomePage />
    </Box>
  )
}

export default Page

