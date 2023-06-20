import {
  Fragment,
  useRef,
  useState,
} from 'react';

import Draggable from 'react-draggable';
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
import Tooltip from '@mui/material/Tooltip';

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
  menus?: Array<{
    title: string;
    icon: JSX.Element;
    click: () => void;
  }>;
}

function Navigator(props: NavigatorProps) {
  const { backUrl, menus } = props;
  const ref = useRef<any>(null);
  const [state, setState] = useState<{ isOpen: boolean; preOperation: string }>(
    { isOpen: false, preOperation: "" }
  );
  const handleClose = ()=>{
    setState({
      ...state,
      isOpen:false
    });
  }
  console.log("state:"+JSON.stringify(state));
  const nav = useNavigate();
  let goBack = backUrl
    ? () => {
        nav(backUrl);
      }
    : () => {
        nav(-1);
      };

  return (
    <Fragment>
      <Draggable
        onDrag={(evt) => {
          setState({
            isOpen: false,
            preOperation: "onDrag",
          });
        }}
      >
        <NavigatorButton>
          <Fab
            ref={ref}
            onClick={() => {
              if (state.preOperation != "onDrag") {
                setState({
                  isOpen: !state.isOpen,
                  preOperation: state.preOperation,
                });
              } else {
                setState({
                  isOpen: state.isOpen,
                  preOperation: "onClick",
                });
              }
            }}
            color="primary"
            aria-label="add"
          >
            <MenuIcon />
          </Fab>
          <Menu
            disableScrollLock
            anchorEl={ref.current}
            onClose={handleClose}
            open={state.isOpen}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
          >
            {menus
              ? menus.map((menu) => {
                  return (
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        menu.click();
                      }}
                      key={menu.title}
                    >
                      <Tooltip title={menu.title}>{menu.icon}</Tooltip>
                    </MenuItem>
                  );
                })
              : null}
            <MenuItem
              onClick={() => {
                handleClose();
                nav("/");
              }}
            >
              <HouseIcon fontSize="large" />
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                goBack();
              }}
            >
              <ArrowCircleLeftIcon fontSize="large" />
            </MenuItem>
          </Menu>
        </NavigatorButton>
      </Draggable>
    </Fragment>
  );
}

export default Navigator;
