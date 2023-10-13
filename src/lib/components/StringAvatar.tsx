"use client";

import { Avatar } from "@mui/material";
import { SxProps } from '@mui/system';

function stringToColor(string: string, saturation: number = 100, lightness: number = 68) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return `hsl(${(hash % 360)}, ${saturation}%, ${lightness}%)`;
}

interface StringAvatarProps {
  string: string;
  sx?: SxProps
}

const StringAvatar: React.FC<StringAvatarProps> = ({
  string,
  sx
}) => {
  return (
    <Avatar sx={{ ...sx, bgcolor: stringToColor(string) }}>
      {Array.from(string)[0]}
    </Avatar>
  )
}

export default StringAvatar
