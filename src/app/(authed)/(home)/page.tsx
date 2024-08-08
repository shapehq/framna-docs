import { env } from "@/common"
import HighlightText from "@/common/ui/HighlightText"
import { Box, Typography } from "@mui/material"
import { BASE_COLORS } from "@/common/theme/theme"
import { grey } from "@mui/material/colors"
import Image from "next/image"
import MessageLinkFooter from "@/common/ui/MessageLinkFooter"

const SITE_NAME = env.getOrThrow("NEXT_PUBLIC_SHAPE_DOCS_TITLE")
const HELP_URL = env.get("NEXT_PUBLIC_SHAPE_DOCS_HELP_URL")


const Page = () => {
  const title = "Welcome to "
  const description = [
    "Easily manage and preview your OpenAPI documentation with GitHub integration",
    "Simple, efficient, and collaborative"
  ]

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
    <Box
      position="absolute"
      display={{ xs: "none", sm: "none", md: "flex"}}
      alignItems="center"
      width={1}
      height={100}
      top={-10}
      left={350}
      gap={2}
      sx={{ color: grey[500] }}
    >
      <Box width={80} height={100} position="relative" mr={1}>
          <Image
            src="/images/arrow_04.svg"
            alt="arrow"
            layout="fill"
            objectFit="contain"
          />
        </Box>
        <Typography sx={{
          display: { md: "flex" },
          fontSize: 16,
          fontStyle: "italic"
        }}>
          Start a new project here!
        </Typography>
    </Box>
    <Box
      position="absolute"
      display={{ xs: "none", sm: "none", md: "flex"}}
      alignItems="start"
      width={1}
      height={100}
      top={120}
      left={350}
      gap={2}
      sx={{ color: grey[500] }}
    >
      <Box width={80} height={80} position="relative" mr={1}>
          <Image
            src="/images/arrow_04.svg"
            alt="arrow"
            layout="fill"
            objectFit="contain"
          />
        </Box>
        <Typography sx={{
          fontSize: 16,
          fontStyle: "italic",
          position: "absolute",
          top: 28,
          left: 100
        }}>
          Find all your project docs here
        </Typography>
    </Box>
    <Box
      position="absolute"
      display={{ xs: "none", sm: "none", md: "flex"}}
      alignItems="start"
      width={1}
      height={100}
      bottom={0}
      left={350}
      gap={2}
      sx={{ color: grey[500] }}
    >
      <Box width={70} height={70} position="relative" mr={1}>
          <Image
            src="/images/arrow_07.svg"
            alt="arrow"
            layout="fill"
            objectFit="contain"
          />
        </Box>
        <Typography sx={{
          fontSize: 16,
          fontStyle: "italic",
          position: "absolute",
          bottom: 100,
          left: 70

        }}>
          Explore more features here
        </Typography>
    </Box>
    
    <HighlightText
      content={`${title} ${SITE_NAME}`}
      highlight={[SITE_NAME]}
      color={[BASE_COLORS[0]]}
      variant="h3"
      opacity={7}
    />
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      width={1}
      gap={2}      
    >
      {description.map((line, index) => (
        <Typography 
          key={`description-line-${index}`}
          sx={{
            display: { md: "flex" },
            fontSize: 20,
            color: grey[700]
          }}
        >
          {line}
        </Typography>
      ))}
    </Box>
    
    {HELP_URL && 
      <Box
        position="absolute"
        sx={{ color: grey[500] }}
        bottom={30}
        marginLeft="auto"
      >
        <MessageLinkFooter
          url={`${HELP_URL}/Browsing-Documentation`}
          content="Lost? Read more about it in our wiki documentation"
        />
      </Box>
    }

  </Box>
)}

export default Page

