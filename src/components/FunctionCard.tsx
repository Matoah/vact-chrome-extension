import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  alpha,
  useTheme,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';

interface FunctionCardProps {
  title: string;
  avatarSrc?: string;
  avatarIcon?: JSX.Element;
  desc: string;
  to: string;
}

function FunctionCard(props: FunctionCardProps) {
  const { title, avatarSrc, desc, to, avatarIcon } = props;
  const theme = useTheme();
  const [elevation, setElevation] = useState(1);
  const nav = useNavigate();
  const clickHandler = () => {
    nav(to);
  };
  return (
    <Grid item xs={12} md={"auto"} sx={{ cursor: "pointer" }}>
      <Zoom in={true}>
        <Paper
          sx={{
            p: 3,
            width: 500,
            cursor: "pointer",
            textAlign: "center",
            transition: `${theme.transitions.create([
              "box-shadow",
              "transform",
            ])}`,
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
          onClick={clickHandler}
        >
          {avatarIcon ? (
            <Avatar
              sx={{
                width: 90,
                height: 90,
                mb: 2,
                mx: "auto",
                //@ts-ignore
                border: `${theme.colors.alpha.white[100]} solid 3px`,
                //@ts-ignore
                boxShadow: `0 0 0 3px ${theme.colors.primary.main}`,
              }}
            >
              {avatarIcon}
            </Avatar>
          ) : (
            <Avatar
              sx={{
                width: 90,
                height: 90,
                mb: 2,
                mx: "auto",
                //@ts-ignore
                border: `${theme.colors.alpha.white[100]} solid 3px`,
                //@ts-ignore
                boxShadow: `0 0 0 3px ${theme.colors.primary.main}`,
              }}
              src={avatarSrc}
            />
          )}
          <Typography gutterBottom variant="h3">
            {title}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {desc}
          </Typography>
        </Paper>
      </Zoom>
    </Grid>
  );
}

export default FunctionCard;
