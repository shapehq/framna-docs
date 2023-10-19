import { ListItem, ListItemText, Skeleton} from "@mui/material"

const ProjectListItemPlaceholder = ({ divider }: { divider: boolean }) => {
  return (
    <ListItem
      disablePadding
      divider={divider}
      sx={{
        paddingLeft: "15px",
        paddingRight: "15px",
        paddingTop: "10px",
        paddingBottom: "10px"
      }}
    >
      <Skeleton
        variant="circular"
        animation="wave"
        sx={{ width: 35, height: 35, marginRight: "10px" }}
      />
      <ListItemText primary={
        <Skeleton variant="text" animation="wave" width={100}/>
      } />
    </ListItem>
  )
}

export default ProjectListItemPlaceholder