import { List, Button } from "@mui/material"
import ThickDivider from "@/common/ui/ThickDivider"
import DocumentationVisualizationPicker from "./DocumentationVisualizationPicker"
import { signOut } from "next-auth/react"

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
        sx={{ marginTop: 1.3 }}
        onClick={() => signOut()}
      >
        Log out
      </Button>
    </List>
  )
}

export default SettingsList
