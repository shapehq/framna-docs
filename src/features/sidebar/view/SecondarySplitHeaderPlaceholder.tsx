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
          maxWidth: "1460px",
          margin: "auto",
          height: 60,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            justifyContent: "end",
            paddingRight: "30px",
          }}
        >
          <Stack direction="row" alignItems="center" gap={2}>
            {Array.from({ length: skeletonCount }, (_, index) => (
              <React.Fragment key={index}>
                <Skeleton variant="rounded" width={70} height={30} />
                {index < skeletonCount - 1 && (
                  <Typography variant="h6" sx={{ marginRight: 1 }}>
                    /
                  </Typography>
                )}
              </React.Fragment>
            ))}
          </Stack>
        </Box>
      </Box>
      <Divider />
    </Box>
  );
};

export default SecondaryHeaderPlaceholder;
