import { signOut } from "next-auth/react"
import Link from "next/link"
import { List, Button, Stack, Typography } from "@mui/material"
import ThickDivider from "@/common/ui/ThickDivider"
import DocumentationVisualizationPicker from "./DocumentationVisualizationPicker"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons"
  
const SettingsItem = ({ onClick, icon, children }: {
  onClick?: () => void
  icon?: IconProp
  children?: React.ReactNode
}) => {
  return (
    <Button
      variant="text"
      fullWidth={true}
      style={{ justifyContent: "flex-start" }}
      sx={{ marginTop: 1.3 }}
      onClick={onClick}
    >
      <Stack direction="row" alignItems="center" width="100%">
        {icon && <FontAwesomeIcon icon={icon} size="lg" style={{ marginRight: 10 }} /> }
        {children}
      </Stack>
    </Button>
  )
}

const SettingsList = () => {
  const helpURL = process.env.NEXT_PUBLIC_SHAPE_DOCS_HELP_URL
  return (
    <List sx={{
      padding: 1,
      paddingLeft: 1.5,
      paddingRight: 1.5,
      paddingBottom: 0.5,
      minWidth: 250
    }}>
      <DocumentationVisualizationPicker sx={{
        marginBottom: 2,
        paddingLeft: 0.5,
        paddingRight: 0.5
      }} />
      <ThickDivider sx={{ marginLeft: -2, marginRight: -2 }} />
      {helpURL &&
        <Link href={`${helpURL}`} target="_blank">
          <SettingsItem icon={faQuestionCircle}>
            <Typography>
              Help
            </Typography>
          </SettingsItem>
        </Link>
      }
      <SettingsItem onClick={() => signOut()} icon={faArrowRightFromBracket}>
        <Typography>
          Log out
        </Typography>
      </SettingsItem>
    </List>
  )
}

export default SettingsList
