import {
  createElement,
  Fragment,
  useState,
} from 'react';

import DoneAllIcon from '@mui/icons-material/DoneAll';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FastForwardIcon from '@mui/icons-material/FastForward';
import LabelOffIcon from '@mui/icons-material/LabelOff';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import UploadIcon from '@mui/icons-material/Upload';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import {
  removeBreakpoint,
  setMethod,
  setRule,
  updateBreakpoint,
  updateOperation,
} from '../slices/fontendDebugger';
import {
  useDispatch,
  useSelector,
} from '../store';
import { isEqual } from '../utils/BreakpointUtils';
import {
  Breakpoint,
  FrontendDebuggerState,
  Operation,
} from '../utils/Types';
import OperationButton from './OperationButton';

const operationIcons = {
  DoneAll: DoneAllIcon,
  Download: DownloadIcon,
  FastForward: FastForwardIcon,
  LabelOff: LabelOffIcon,
  SkipNext: SkipNextIcon,
  Upload: UploadIcon,
};

const operationDisableHandlers: {
  [code: string]: (
    operation: Operation,
    operations: Operation[],
    state: FrontendDebuggerState
  ) => boolean;
} = {
  play: function (
    operation: Operation,
    operations: Operation[],
    state: FrontendDebuggerState
  ) {
    return !state.debug || true;
  },
  next: function (
    operation: Operation,
    operations: Operation[],
    state: FrontendDebuggerState
  ) {
    return !state.debug || true;
  },
  breakAll: function (
    operation: Operation,
    operations: Operation[],
    state: FrontendDebuggerState
  ) {
    const op = operations.find((p) => p.code == "disableAll");
    if (op) {
      return op.active;
    }
    return false;
  },
};

interface ContextMenuItem {
  code: string;
  title: string;
  click: () => void;
}

interface FrontendDebugAttrPanelProps {}

const StyledBox = styled(Box)(({ theme }) => ({
  boxShadow: `0px 0px 2px #996a6a`,
  //borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.4)}`,
}));

const breakpointToKey = function (breakpoint: Breakpoint) {
  const { location } = breakpoint;
  const { componentCode, windowCode, methodCode, ruleCode } = location;
  return windowCode
    ? `window_breakpoint_$_${componentCode}_$_${windowCode}_$_${methodCode}_$_${ruleCode}`
    : `component_breakpoint_$_${componentCode}_$_${methodCode}_$_${ruleCode}`;
};

const filterMenus = function (
  menus: ContextMenuItem[],
  operations: Operation[],
  breakpoints: Breakpoint[],
  breakpoint?: Breakpoint
) {
  if (breakpoint) {
    const codes = ["remove", "position"];
    if (breakpoint.enable) {
      codes.push("disable");
    } else {
      codes.push("enable");
    }
    const op = operations.find((op) => op.code == "disableAll");
    if (op?.active) {
      codes.push("enableAll");
    } else {
      codes.push("disableAll");
    }
    if (breakpoints.length > 0) {
      codes.push("clear");
    }
    if (breakpoints.length > 1) {
      codes.push("clearOther");
    }
    const result: ContextMenuItem[] = [];
    menus.forEach((menu) => {
      if (codes.indexOf(menu.code) != -1) {
        result.push(menu);
      }
    });
    return result;
  }
  return [];
};

function FrontendDebugAttrPanel(props: FrontendDebugAttrPanelProps) {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.frontendDebugger);
  const { operations, breakpoints, debug } = state;
  const [contextMenu, setContextMenu] = useState<{
    mousePosition: { mouseX: number; mouseY: number } | null;
    breakpoint?: Breakpoint;
  }>({ mousePosition: null, breakpoint: undefined });
  const contextMenuItems = [
    {
      code: "remove",
      title: "移除断点",
      click: () => {
        if (contextMenu.breakpoint) {
          dispatch(removeBreakpoint(contextMenu.breakpoint));
        }
      },
    },
    {
      code: "position",
      title: "显示位置",
      click: () => {
        if (contextMenu.breakpoint) {
          const breakpoint = contextMenu.breakpoint;
          dispatch(setMethod(breakpoint.location));
          dispatch(
            setRule({
              method: breakpoint.location,
              code: breakpoint.location.ruleCode,
            })
          );
        }
      },
    },
    {
      code: "disable",
      title: "停用断点",
      click: () => {
        if (contextMenu.breakpoint) {
          const breakpoint = contextMenu.breakpoint;
          const bp: Breakpoint = {
            enable: false,
            location: {
              ...breakpoint.location,
            },
          };
          dispatch(updateBreakpoint(bp));
        }
      },
    },
    {
      code: "enable",
      title: "启用断点",
      click: () => {
        if (contextMenu.breakpoint) {
          const breakpoint = contextMenu.breakpoint;
          const bp: Breakpoint = {
            enable: true,
            location: {
              ...breakpoint.location,
            },
          };
          dispatch(updateBreakpoint(bp));
        }
      },
    },
    {
      code: "disableAll",
      title: "禁用所有断点",
      click: () => {
        const op = operations.find((op) => op.code == "disableAll");
        if (op) {
          dispatch(
            updateOperation({
              ...op,
              active: true,
            })
          );
        }
      },
    },
    {
      code: "enableAll",
      title: "启用所有断点",
      click: () => {
        const op = operations.find((op) => op.code == "disableAll");
        if (op) {
          dispatch(
            updateOperation({
              ...op,
              active: false,
            })
          );
        }
      },
    },
    {
      code: "clear",
      title: "删除所有断点",
      click: () => {
        dispatch(removeBreakpoint(breakpoints));
      },
    },
    {
      code: "clearOther",
      title: "删除其他断点",
      click: () => {
        if (contextMenu.breakpoint) {
          const breakpoint = contextMenu.breakpoint;
          const removed: Breakpoint[] = [];
          breakpoints.forEach((bp) => {
            if (!isEqual(bp, breakpoint)) {
              removed.push(bp);
            }
          });
          if (removed.length > 0) {
            dispatch(removeBreakpoint(removed));
          }
        }
      },
    },
  ];
  const [data, setData] = useState({
    expand: {
      monitor: true,
      breakpoint: true,
    },
  });
  const handleContextMenu = (
    event: React.MouseEvent,
    breakpoint: Breakpoint
  ) => {
    event.preventDefault();
    setContextMenu({
      mousePosition:
        contextMenu.mousePosition === null
          ? {
              mouseX: event.clientX + 2,
              mouseY: event.clientY - 6,
            }
          : null,
      breakpoint,
    });
  };
  const handleOperationClick = (operation: string, active: boolean) => {
    if (operation == "disableAll") {
      const op = operations.find((o) => o.code == "disableAll");
      if (op) {
        dispatch(updateOperation({ ...op, active }));
      }
    } else if (operation == "breakAll") {
      const op = operations.find((o) => o.code == "breakAll");
      if (op) {
        dispatch(updateOperation({ ...op, active }));
      }
    }
  };
  const handleContextMenuClose = () => {
    setContextMenu({ mousePosition: null, breakpoint: undefined });
  };
  const menus = filterMenus(
    contextMenuItems,
    operations,
    breakpoints,
    contextMenu.breakpoint
  );
  return (
    <Fragment>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        <Card sx={{ flex: 1, ml: 1, display: "flex", flexDirection: "column" }}>
          <StyledBox sx={{ width: "100%" }}>
            {operations.map((operation) => {
              let disabled = operation.disabled;
              if (typeof disabled == "string") {
                const handler = operationDisableHandlers[disabled];
                disabled = !!handler(operation, operations, state);
              }
              //@ts-ignore
              const iconDef = operationIcons[operation.icon];
              return (
                <OperationButton
                  key={operation.code}
                  title={operation.title}
                  active={operation.active}
                  disabled={disabled}
                  onClick={() => {
                    handleOperationClick(operation.code, !operation.active);
                  }}
                  icon={
                    iconDef
                      ? createElement(iconDef, { fontSize: "small" })
                      : null
                  }
                />
              );
            })}
          </StyledBox>
          <Box sx={{ flex: 1, pt: 1, overflow: "auto" }}>
            <Accordion
              expanded={data.expand["monitor"]}
              onChange={() => {
                const expand = { ...data.expand };
                expand["monitor"] = !expand.monitor;
                setData({
                  ...data,
                  expand,
                });
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography variant="body2">监视</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "0px" }}>
                <Typography>
                  Nulla facilisi. Phasellus sollicitudin nulla et quam mattis
                  feugiat. Aliquam eget maximus est, id dignissim quam.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={data.expand["breakpoint"]}
              onChange={() => {
                const expand = { ...data.expand };
                expand["breakpoint"] = !expand.breakpoint;
                setData({
                  ...data,
                  expand,
                });
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2bh-content"
                id="panel2bh-header"
              >
                <Typography>断点</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "0px" }}>
                {breakpoints ? (
                  <Box sx={{ overflow: "auto" }}>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          {breakpoints.map((breakpoint) => {
                            return (
                              <TableRow
                                key={breakpointToKey(breakpoint)}
                                onDoubleClick={() => {
                                  dispatch(setMethod(breakpoint.location));
                                  dispatch(
                                    setRule({
                                      method: breakpoint.location,
                                      code: breakpoint.location.ruleCode,
                                    })
                                  );
                                }}
                                onContextMenu={(evt) => {
                                  handleContextMenu(evt, breakpoint);
                                }}
                              >
                                <TableCell
                                  align="center"
                                  sx={{ width: "50px", padding: "0px" }}
                                >
                                  <Checkbox
                                    size="small"
                                    disabled={
                                      operations.find(
                                        (op) => op.code == "disableAll"
                                      )?.active
                                    }
                                    checked={breakpoint.enable}
                                    onChange={(evt, checked) => {
                                      dispatch(
                                        updateBreakpoint({
                                          enable: checked,
                                          location: breakpoint.location,
                                        })
                                      );
                                    }}
                                  ></Checkbox>
                                </TableCell>
                                <TableCell align="left" sx={{ flex: 1 }}>
                                  {breakpoint.location.ruleCode}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : null}
              </AccordionDetails>
            </Accordion>
          </Box>
        </Card>
      </Box>
      <Menu
        open={contextMenu.mousePosition !== null}
        onClose={() => {
          handleContextMenuClose();
        }}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu.mousePosition !== null
            ? {
                top: contextMenu.mousePosition.mouseY,
                left: contextMenu.mousePosition.mouseX,
              }
            : undefined
        }
      >
        {menus.map((menu) => {
          return (
            <MenuItem
              key={menu.code}
              onClick={() => {
                menu.click();
                handleContextMenuClose();
              }}
            >
              {menu.title}
            </MenuItem>
          );
        })}
      </Menu>
    </Fragment>
  );
}

export default FrontendDebugAttrPanel;
