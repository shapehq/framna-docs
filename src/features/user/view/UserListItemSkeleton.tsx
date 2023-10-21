import { Box, Skeleton } from "@mui/material"

const UserListItemSkeleton: React.FC = () => {
  return (
    <Box
      component="div"
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15
      }}
    >
      <Skeleton variant="circular" sx={{ width: 40, height: 40 }}/>
      <Box sx={{ marginLeft: "10px" }}>
        <Skeleton variant="text" width={100} />
      </Box>
    </Box>
  )
}

export default UserListItemSkeleton
