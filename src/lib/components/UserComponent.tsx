import { Avatar, Box } from "@mui/material";
import { IUserProvider } from "../auth/IUserProvider";
import SettingsComponent from "./SettingsComponent"
import { SIDEBAR_SPACING } from "../style/dimensions";

interface UserComponentProps {
  userProvider: IUserProvider;
}

const UserComponent: React.FC<UserComponentProps> = async ({
  userProvider,
}) => {
  const user = await userProvider.getUser();
  
  return (
    <Box
      component="div"
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginTop: SIDEBAR_SPACING,
      }}
    >
      <Avatar src={user.avatarURL} alt={user.name} />
      <Box sx={{padding: "10px", flex: 1}}>{user.name}</Box>
      <SettingsComponent/>
    </Box>
  );
};

export default UserComponent;
