import { Box, Typography } from "@mui/material"
import Image from "next/image"
import { grey } from "@mui/material/colors"

const ShowSectionsLayer = () => {

  return (
    <>
      <Box
        position="absolute"
        display={{ xs: "flex", sm: "flex", md: "none"}}
        alignItems="start"
        width={1}
        height={100}
        top={27}
        left={80}
        gap={2}
        sx={{ color: grey[500] }}
      >
        <Box width={70} height={70} position="relative" mr={1} sx={{ transform: "rotate(10deg) scaleX(-1)" }}>
          <Image
            src="/images/arrow_26.svg"
            alt="arrow"
            layout="fill"
            objectFit="contain"
          />
        </Box>
        <Typography sx={{
          fontSize: 16,
          fontStyle: "italic",
          position: "absolute",
          top: 90,
          left: 0

        }}>
          Check all the cool features here!
        </Typography>
      </Box>

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
            And explore more features here
          </Typography>
      </Box>
    </>
  )
}

export default ShowSectionsLayer