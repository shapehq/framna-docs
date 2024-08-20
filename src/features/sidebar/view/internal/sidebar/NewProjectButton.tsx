"use client"

import { useRouter, usePathname } from "next/navigation"
import { Stack, List } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { Template as ProjectListItemTemplate } from "./projects/ProjectListItem"
import { Squircle as ProjectAvatarSquircle } from "./projects/ProjectAvatar"
import { useTheme } from "@mui/material/styles"

const NewProjectButton = () => {
  const router = useRouter()
  const pathname = usePathname()
  const theme = useTheme()
  return (
    <List disablePadding>
      <ProjectListItemTemplate
        title="New Project"
        selected={pathname === "/new"}
        avatar={
          <ProjectAvatarSquircle
            width={40}
            height={40}
            sx={{ background: "#dfdfdf" }}
            >
            <Stack sx={{ height: "100%" }} justifyContent="center">
              <FontAwesomeIcon icon={faPlus} size="lg" color="#bababa" />
            </Stack>
          </ProjectAvatarSquircle>
        }
        onSelect={() => {
          router.push("/new")
        }}
      />
    </List>
  )
}

export default NewProjectButton
