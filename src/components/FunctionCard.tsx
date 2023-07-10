import { useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ElevationPaper from './ElevationPaper';

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
  const nav = useNavigate();
  const clickHandler = () => {
    nav(to);
  };
  return (
    <Grid item xs={12} md={"auto"} sx={{ cursor: "pointer" }}>
        <ElevationPaper onClick={clickHandler}>
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
        </ElevationPaper>
    </Grid>
  );
}

export default FunctionCard;
