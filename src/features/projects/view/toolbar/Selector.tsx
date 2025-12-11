import { SxProps } from "@mui/system"
import {
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  Typography,
  Box,
  Tooltip
} from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"

interface SelectorItem {
  readonly id: string
  readonly name: string
  readonly hasChanges?: boolean
}

const Selector = ({
  items,
  selection,
  onSelect,
  sx
}: {
  items: SelectorItem[]
  selection: string
  onSelect: (itemId: string) => void
  sx?: SxProps
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    onSelect(event.target.value)
  }
  return (
    <FormControl sx={{ m: 1, margin: 0, ...sx }} size="small">
      <Select
        defaultValue={selection}
        onChange={handleChange}
        inputProps={{
          IconComponent: () => null,
          sx: {
            paddingTop: { xs: "10px !important", sm: "6px !important" },
            paddingBottom: { xs: "10px !important", sm: "6px !important" },
            paddingLeft: { xs: "15px !important", sm: "12px !important" },
            paddingRight: { xs: "15px !important", sm: "12px !important" },
          }
        }}
      >
        {items.map(item => (
          <MenuItem key={item.id} value={item.id}>
            <MenuItemHover>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography sx={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis"
                }}>
                  {item.name}
                </Typography>
                {item.hasChanges && (
                  <Tooltip title="Has changes" arrow>
                    <Box
                      component="span"
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "warning.main",
                        flexShrink: 0
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
            </MenuItemHover>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default Selector
