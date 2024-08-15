"use client"

import { useRouter, usePathname } from "next/navigation"
import { Stack, List } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { Template as ProjectListItemTemplate } from "./projects/ProjectListItem"

const NewProjectButton = () => {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <List disablePadding>
      <ProjectListItemTemplate
        title="New Project"
        selected={pathname === "/new"}
        avatar={
          <Stack sx={{ height: "100%" }} justifyContent="center">
            <FontAwesomeIcon icon={faPlus} size="lg" />
          </Stack>
        }
        onSelect={() => {
          router.push("/new")
        }}
      />
    </List>
  )
}

export default NewProjectButton
