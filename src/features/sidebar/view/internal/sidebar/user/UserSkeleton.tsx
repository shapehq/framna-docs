import { Box, Stack, Skeleton } from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"

const UserSkeleton = () => {
  return (
    <MenuItemHover disabled>
      <Stack direction="row" alignItems="center" sx={{ width: "100%" }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ marginLeft: "10px" }}>
          <Skeleton variant="text" width={90}/>
        </Box>
      </Stack>
    </MenuItemHover>
  )
}

export default UserSkeleton
