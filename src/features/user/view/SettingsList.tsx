import { List, Button } from "@mui/material"
import ThickDivider from "@/common/ui/ThickDivider"
import DocumentationVisualizationPicker from "./DocumentationVisualizationPicker"

const SettingsList = () => {
  return (
    <List sx={{
      padding: 1,
      paddingLeft: 2,
      paddingRight: 2,
      paddingBottom: 0.5,
      minWidth: 250
    }}>
      <DocumentationVisualizationPicker sx={{ marginBottom: 2 }} />
      <ThickDivider sx={{ marginLeft: -2, marginRight: -2 }} />
      <Button
        variant="text"
        fullWidth={true}
        style={{justifyContent: "flex-start"}}
        href="/api/auth/logout"
        sx={{ marginTop: "10px" }}
      >
        Log out
      </Button>
    </List>
  )
}

export default SettingsList
