"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { Session } from "next-auth"
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Popover,
  Typography
} from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"
import UserSkeleton from "./UserSkeleton"

const UserButton = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const isLoading = status == "loading"
  return (
    <List disablePadding>
      <ListItem disablePadding>
        {!isLoading && session &&
          <UserButtonWithSession session={session}>
            {children}
          </UserButtonWithSession>
        }
        {isLoading && <UserSkeleton/>}
      </ListItem>
    </List>
  )
}

export default UserButton

const UserButtonWithSession = ({
  session,
  children
}: {
  session: Session
  children?: React.ReactNode
}) => {
  const [popoverAnchorElement, setPopoverAnchorElement] = useState<HTMLDivElement | null>(null)
  const handlePopoverClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setPopoverAnchorElement(event.currentTarget)
  }
  const handlePopoverClose = () => {
    setPopoverAnchorElement(null)
  }
  const isPopoverOpen = Boolean(popoverAnchorElement)
  const id = isPopoverOpen ? "settings-popover" : undefined
  const user = session.user
  return (
    <>
      <Popover
        id={id}
        open={isPopoverOpen}
        anchorEl={popoverAnchorElement}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left"
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
      >
        {children}
      </Popover>
      <ListItemButton
        onClick={handlePopoverClick}
        aria-describedby={id}
        disableGutters
        sx={{ padding: 0 }}
      >
        <MenuItemHover>
          <Stack direction="row" alignItems="center">
            {user && 
              <Avatar src={user.image} sx={{ width: 40, height: 40 }} alt={user.name || user.email} />
            }
            <Box sx={{ marginLeft: "10px" }}>
              {user &&
                <Typography sx={{ fontWeight: 500 }}>
                  {user.name || user.email}
                </Typography>
              }
            </Box>
          </Stack>
        </MenuItemHover>
      </ListItemButton>
    </>
  )
}
