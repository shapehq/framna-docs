import { Box, Stack, Skeleton } from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"

const UserSkeleton = () => {
  return (
    <Stack direction="row" alignItems="center" sx={{
      width: "100%",
      paddingLeft: 1.25,
      paddingRight: 1.25,
      paddingTop: 1,
      paddingBottom: 1,
    }}>
      <Skeleton variant="circular" width={40} height={40} />
      <Box sx={{ marginLeft: "10px" }}>
        <Skeleton variant="text" width={90}/>
      </Box>
    </Stack>
  )
}

export default UserSkeleton
