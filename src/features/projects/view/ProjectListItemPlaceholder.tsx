import { ListItem, ListItemText, Skeleton} from "@mui/material"

const ProjectListItemPlaceholder = () => {
  return (
    <ListItem
      disablePadding
      sx={{
        paddingLeft: "15px",
        paddingRight: "15px",
        paddingTop: "15px",
        paddingBottom: "15px"
      }}
    >
      <Skeleton
        variant="circular"
        animation="wave"
        sx={{ width: 40, height: 40, marginRight: "12px" }}
      />
      <ListItemText primary={
        <Skeleton variant="text" animation="wave" width={100}/>
      } />
    </ListItem>
  )
}

export default ProjectListItemPlaceholder