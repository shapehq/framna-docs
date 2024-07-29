import { IconButton } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"

const ToggleMobileToolbarButton = ({
  direction,
  onToggle
}: {
  direction: "up" | "down"
  onToggle: () => void
}) => {
  return <>
    <IconButton
      color="primary"
      edge="end"
      onClick={onToggle}
      sx={{ display: { sm: "flex", md: "none" } }}
    >
      <FontAwesomeIcon
        icon={faChevronDown}
        size="2xs"
        style={{
          aspectRatio: 1,
          padding: 2,
          transform: direction == "up" ? "rotate(180deg)" : "none"
        }}
      />
    </IconButton>
  </>
}

export default ToggleMobileToolbarButton
