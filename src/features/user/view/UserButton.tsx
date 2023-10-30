import { useState } from "react"
import { UserProfile } from "@auth0/nextjs-auth0/client"
import {
  Avatar,
  Box,
  ListItemButton,
  Stack,
  Popover,
  Typography
} from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsis } from "@fortawesome/free-solid-svg-icons"
import MenuItemHover from "@/common/ui/MenuItemHover"
import SettingsList from "./SettingsList"

const UserButton = ({ user }: { user: UserProfile }) => {
  const [popoverAnchorElement, setPopoverAnchorElement] = useState<HTMLDivElement | null>(null)
  const handlePopoverClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setPopoverAnchorElement(event.currentTarget)
  }
  const handlePopoverClose = () => {
    setPopoverAnchorElement(null)
  }
  const isPopoverOpen = Boolean(popoverAnchorElement)
  const id = isPopoverOpen ? "settings-popover" : undefined
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
        <SettingsList/>
      </Popover>
      <ListItemButton
        onClick={handlePopoverClick}
        aria-describedby={id}
        disableGutters
        sx={{ padding: 0 }}
      >
        <MenuItemHover>
          <Stack direction="row" alignItems="center">
            {user.picture && 
              <Avatar src={user.picture} sx={{ width: 40, height: 40 }} alt={user.name || ""} />
            }
            <Box sx={{ marginLeft: "10px" }}>
              {user &&
                <Typography sx={{ fontWeight: 600 }}>
                  {user.name}
                </Typography>
              }
            </Box>
            {user &&
              <>
                <Box sx={{flex: 1}} />
                <FontAwesomeIcon icon={faEllipsis}/>
              </>
            }
          </Stack>
        </MenuItemHover>
      </ListItemButton>
    </>
  )
}

export default UserButton
