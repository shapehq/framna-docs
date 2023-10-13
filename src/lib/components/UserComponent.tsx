import { Avatar, Box } from "@mui/material";
import { IUserProvider } from "../auth/IUserProvider";
import SettingsComponent from "./SettingsComponent"
import { SIDEBAR_SPACING } from "../style/dimensions";
import { IUser } from "../auth/IUser";

interface UserComponentProps {
  user: IUser;
}

const UserComponent: React.FC<UserComponentProps> = async ({
  user,
}) => {
  const name = user.name !== "" ? user.name : user.userName;
  
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
      <Avatar src={user.avatarURL} alt={name} />
      <Box sx={{padding: "10px", flex: 1}}>{name}</Box>
      <SettingsComponent/>
    </Box>
  );
};

export default UserComponent;
