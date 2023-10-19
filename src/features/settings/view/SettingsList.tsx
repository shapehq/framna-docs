import { List, Button } from "@mui/material"
import DocumentationVisualizationPicker from "./DocumentationVisualizationPicker"

const SettingsList: React.FC = () => {
  return (
    <List sx={{ padding: "10px"}}>
      <DocumentationVisualizationPicker/>
      <Button
        variant="text"
        fullWidth={true}
        style={{justifyContent: "flex-start"}}
        href="/api/auth/logout"
        sx={{ marginTop: "10px" }}
        color="primary"
      >
        Log out
      </Button>
    </List>
  )
}

export default SettingsList
