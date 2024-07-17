import { useSession } from "next-auth/react"
import { List, ListItem } from "@mui/material"
import UserButton from "./UserButton"
import UserSkeleton from "./UserSkeleton"

const UserFooter = () => {
  const { data: session, status } = useSession()
  const isLoading = status == "loading"
  return (
    <List disablePadding>
      <ListItem disablePadding>
        {!isLoading && session && <UserButton session={session}/> }
        {isLoading && <UserSkeleton/>}
      </ListItem>
    </List>
  )
}

export default UserFooter
