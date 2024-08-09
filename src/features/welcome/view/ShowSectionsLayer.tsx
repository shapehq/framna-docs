"use client"

import { Box, Typography } from "@mui/material"
import Image from "next/image"
import { grey } from "@mui/material/colors"
import ARROW_26 from "../../../../public/images/arrow_26.png"
import ARROW_04 from "../../../../public/images/arrow_04.png"
import ARROW_07 from "../../../../public/images/arrow_07.png"
import { useSession } from "next-auth/react"
import { useContext } from "react"
import { ProjectsContainerContext } from "@/common"

const ShowSectionsLayer = () => {
  const { data: session, status } = useSession()
  const { projects, isLoading } = useContext(ProjectsContainerContext)

  const isLoadingSession = status == "loading"

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
            src={ARROW_26}
            alt="arrow"
            fill
            style={{ objectFit: "contain" }}
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
              src={ARROW_04}
              alt="arrow"
              fill
              style={{ objectFit: "contain" }}
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

      {!isLoading &&
        <Box
          position="absolute"
          display={{ xs: "none", sm: "none", md: "flex"}}
          alignItems="start"
          width={1}
          height={100}
          top={projects.length > 0 ? 120 : 90}
          left={350}
          gap={2}
          sx={{ color: grey[500] }}
        >
          <Box width={80} height={80} position="relative" mr={1}>
            <Image
              src={ARROW_04}
              alt="arrow"
              fill
              style={{ objectFit: "contain" }}
            />
          </Box>
          {projects.length > 0 ? 
            <Typography sx={{
              fontSize: 16,
              fontStyle: "italic",
              position: "absolute",
              top: 28,
              left: 100
            }}>
              Find all your project docs here
            </Typography> : 
            <>
              <Box
                width={70}
                height={80}
                position="absolute"
                top={-60}
                left={310}
                mr={1}
                sx={{ transform: "rotate(70deg) " }}
              >
                <Image
                  src={ARROW_26}
                  alt="arrow"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </Box>
              <Typography sx={{
                fontSize: 16,
                fontStyle: "italic",
                position: "absolute",
                top: 28,
                left: 100
              }}>
                Oops, it looks like you don&apos;t have any project set up yet
              </Typography>
            </>
          }
        </Box>
      }
      {!isLoadingSession && session && session.user &&
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
                src={ARROW_07}
                alt="arrow"
                layout="fill"
                objectFit="contain"
                placeholder="empty"
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
      }
    </>
  )
}

export default ShowSectionsLayer