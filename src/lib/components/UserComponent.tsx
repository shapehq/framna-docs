import { Avatar, Box, Button } from "@mui/material";
import { IUserProvider } from "../auth/IUserProvider";
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
        flexDirection: "column",
        marginTop: SIDEBAR_SPACING,
      }}
    >
      <Box
        component="div"
        sx={{
          display: "flex",
          flexDirection: "row",
          marginBottom: "10px",
          "& h2": {
            marginLeft: "10px",
          },
        }}
      >
        <Avatar src={user.avatarURL} alt={user.name} />
        <h2>Hi {user.name} 👋</h2>
      </Box>
      <p>
        <Button
          variant="contained"
          href="/api/auth/logout"
          sx={{
            width: "100%"
          }}
        >
          Log out
        </Button>
      </p>
    </Box>
  );
};

export default UserComponent;
