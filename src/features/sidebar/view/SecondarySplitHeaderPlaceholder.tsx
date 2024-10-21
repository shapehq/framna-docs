import { Box, Stack, Divider, Skeleton, Typography } from "@mui/material";
import React from "react";

const SecondaryHeaderPlaceholder = () => {
  const skeletonCount = 4;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 2,
          paddingLeft: { xs: 4, md: 2 },
          margin: "auto",
          height: 64,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            justifyContent: "end",
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            {Array.from({ length: skeletonCount }, (_, index) => (
              <React.Fragment key={index}>
                <Skeleton variant="rounded" width={70} height={28} />
                {index < skeletonCount - 1 && (
                  <Typography variant="h6">
                    /
                  </Typography>
                )}
              </React.Fragment>
            ))}
            <Divider orientation="vertical" flexItem sx={{ height: "38px", marginLeft: 1, marginRight: "6px" }} />
            <Skeleton variant="rounded" width={20} height={24} />
          </Stack>
        </Box>
      </Box>
      <Divider orientation="vertical" flexItem sx={{ marginLeft: 1, marginRight: 1 }} />
    </Box>
  );
};

export default SecondaryHeaderPlaceholder;
