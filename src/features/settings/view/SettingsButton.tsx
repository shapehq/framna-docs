import { useState } from "react"
import { Popover, IconButton } from "@mui/material"
import { MoreHoriz } from "@mui/icons-material"
import SettingsList from "./SettingsList"

const SettingsButton: React.FC = () => {
  const [popoverAnchorElement, setPopoverAnchorElement] = useState<HTMLButtonElement | null>(null)
  
  const handlePopoverClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPopoverAnchorElement(event.currentTarget)
  }
  
  const handlePopoverClose = () => {
    setPopoverAnchorElement(null)
  }
  
  const isPopoverOpen = Boolean(popoverAnchorElement)
  const id = isPopoverOpen ? 'settings-popover' : undefined

  return (
    <>
      <Popover
        id={id}
        open={isPopoverOpen}
        anchorEl={popoverAnchorElement}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <SettingsList/>
      </Popover>
      <IconButton edge="end" onClick={handlePopoverClick}>
        <MoreHoriz />
      </IconButton>
    </>
  )
}

export default SettingsButton
