import {
  Fragment,
  useRef,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import HouseIcon from '@mui/icons-material/House';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Menu from '@mui/material/Menu';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';

const NavigatorButton = styled(Box)(
  ({ theme }) => `
            position: fixed;
            z-index: 9999;
            right: ${theme.spacing(4)};
            bottom: ${theme.spacing(4)};
            
            &::before {
                width: 30px;
                height: 30px;
                content: ' ';
                position: absolute;
                border-radius: 100px;
                left: 13px;
                top: 13px;
                background: ${
                  //@ts-ignore
                  theme.colors.primary.main
                };
                animation: ripple 1s infinite;
                transition: ${theme.transitions.create(["all"])};
            }
  
            .MuiSvgIcon-root {
              animation: pulse 1s infinite;
              transition: ${theme.transitions.create(["all"])};
            }
    `
);

interface NavigatorProps {
  backUrl?: string;
}

function Navigator(props: NavigatorProps) {
  const { backUrl } = props;
  const ref = useRef<any>(null);
  const [isOpen, setOpen] = useState<boolean>(false);
  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };
  const nav = useNavigate();
  let goBack = null;
  if (backUrl) {
    goBack = () => {
      nav(backUrl);
    };
  } else {
    goBack = () => {
      nav(-1);
    };
  }
  return (
    <Fragment>
      <NavigatorButton>
        <Fab ref={ref} onClick={handleOpen} color="primary" aria-label="add">
          <MenuIcon />
        </Fab>
        <Menu
          disableScrollLock
          anchorEl={ref.current}
          onClose={handleClose}
          open={isOpen}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <MenuItem
            onClick={() => {
              nav("/");
            }}
          >
            <HouseIcon fontSize="large" />
          </MenuItem>
          <MenuItem onClick={goBack}>
            <ArrowCircleLeftIcon fontSize="large" />
          </MenuItem>
        </Menu>
      </NavigatorButton>
    </Fragment>
  );
}

export default Navigator;
