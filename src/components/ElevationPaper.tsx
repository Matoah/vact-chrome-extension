import { useState } from 'react';

import {
  alpha,
  useTheme,
} from '@mui/material';
import Paper, { PaperProps } from '@mui/material/Paper';

function ElevationPaper(props: PaperProps) {
  const { children,...others } = props;
  const theme = useTheme();
  const [elevation, setElevation] = useState(1);
  return (
    <Paper
      {...others}
      sx={{
        p: 3,
        width: 500,
        cursor: "pointer",
        textAlign: "center",
        transition: `${theme.transitions.create(["box-shadow", "transform"])}`,
        transform: "translateY(0px)",
        "&:hover": {
          transform: "translateY(-10px) !important",
          boxShadow: `0 2rem 8rem 0 ${alpha(
            //@ts-ignore
            theme.colors.alpha.black[100],
            0.05
          )}, 
                0 0.6rem 1.6rem ${alpha(
                  //@ts-ignore
                  theme.colors.alpha.black[100],
                  0.15
                )}, 
                0 0.2rem 0.2rem ${alpha(
                  //@ts-ignore
                  theme.colors.alpha.black[100],
                  0.1
                )}`,
        },
      }}
      elevation={elevation}
      onMouseOver={() => {
        setElevation(3);
      }}
      onMouseLeave={() => {
        setElevation(1);
      }}
    >
      {children}
    </Paper>
  );
}

export default ElevationPaper;
