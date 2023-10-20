import { ReactNode } from "react"
import { Avatar, Box, Typography, Skeleton } from "@mui/material"
import { useUser } from '@auth0/nextjs-auth0/client'

const UserListItem: React.FC<{
  readonly secondaryItem?: ReactNode
}> = ({
  secondaryItem
}) => {
  const { user, isLoading } = useUser()
  return (
    <Box
      component="div"
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "15px"
      }}
    >
      {!isLoading && user && user.picture && 
        <Avatar src={user.picture} sx={{ width: 40, height: 40 }} alt={user.name || ""} />
      }
      {isLoading &&
        <Skeleton variant="circular" width={40} height={40} />
      }
      <Box sx={{ marginLeft: "10px" }}>
        {!isLoading && user && <Typography>{user.name}</Typography> }
        {isLoading && <Skeleton variant="text" width={90}/> }
      </Box>
      {user && !isLoading && secondaryItem != null &&
        <>
          <Box sx={{flex: 1}} />
          {secondaryItem}
        </>
      }
    </Box>
  )
}

export default UserListItem
