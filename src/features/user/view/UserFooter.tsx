import { useUser } from "@auth0/nextjs-auth0/client"
import { List, ListItem } from "@mui/material"
import UserButton from "./UserButton"
import UserSkeleton from "./UserSkeleton"

const UserFooter = () => {
  const { user, isLoading } = useUser()
  return (
    <List disablePadding>
      <ListItem disablePadding>
        {!isLoading && user && <UserButton user={user}/> }
        {isLoading && <UserSkeleton/>}
        
      </ListItem>
      <ListItem>
        <UserSkeleton/>
      </ListItem>
    </List>
  )
}

export default UserFooter
