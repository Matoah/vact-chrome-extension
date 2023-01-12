import { createElement, Fragment, useState } from "react";

import DoneAllIcon from "@mui/icons-material/DoneAll";
import DownloadIcon from "@mui/icons-material/Download";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FastForwardIcon from "@mui/icons-material/FastForward";
import LabelOffIcon from "@mui/icons-material/LabelOff";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import UploadIcon from "@mui/icons-material/Upload";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import {
  removeBreakpoint,
  setBreakAll,
  setDisableAll,
  setMethod,
  setRule,
  updateBreakpoint,
} from "../slices/fontendDebugger";
import { useDispatch, useSelector } from "../store";
import { isEqual } from "../utils/BreakpointUtils";
import { Breakpoint, FrontendDebuggerState, Operation } from "../utils/Types";
import OperationButton from "./OperationButton";

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

const updateOperation = function (
  operation: { code: string; [name: string]: any },
  operations: Operation[]
): Operation[] {
  const result: Operation[] = [];
  operations.forEach((op) => {
    if (op.code == operation.code) {
      result.push({
        ...op,
        ...operation,
      });
    } else {
      result.push(op);
    }
  });
  return result;
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
  const { breakAll, disableAll, breakpoints, debug } = state;
  const [contextMenu, setContextMenu] = useState<{
    mousePosition: { mouseX: number; mouseY: number } | null;
    breakpoint?: Breakpoint;
  }>({ mousePosition: null, breakpoint: undefined });
  const [data, setData] = useState<{
    operations: Operation[];
    expand: { monitor: boolean; breakpoint: boolean };
  }>({
    operations: [
      {
        code: "play",
        title: "执行到下一个断点(F8)",
        icon: <FastForwardIcon fontSize="small" />,
        disabled: function (
          operation: Operation,
          operations: Operation[],
          state: FrontendDebuggerState
        ) {
          return !state.debug || true;
        },
        click: (state: FrontendDebuggerState, active: boolean) => {
          const { debugCallbackId } = state;
          //@ts-ignore
          if (debugCallbackId && window[debugCallbackId]) {
            //@ts-ignore
            const handler = window[debugCallbackId];
            handler({ operation: "nextBreakpoint" });
          }
        },
        active: false,
      },
      {
        code: "next",
        title: "执行到下一个规则(F10)",
        icon: <SkipNextIcon fontSize="small" />,
        disabled: function (
          operation: Operation,
          operations: Operation[],
          state: FrontendDebuggerState
        ) {
          return !state.debug || true;
        },
        click: (state: FrontendDebuggerState, active: boolean) => {
          const { debugCallbackId } = state;
          //@ts-ignore
          if (debugCallbackId && window[debugCallbackId]) {
            //@ts-ignore
            const handler = window[debugCallbackId];
            handler({ operation: "nextRule" });
          }
        },
        active: false,
      },
      {
        code: "stepIn",
        title: "进入当前方法(F11)",
        icon: <DownloadIcon fontSize="small" />,
        disabled: true,
        active: false,
        click: (state: FrontendDebuggerState, active: boolean) => {
          const { debugCallbackId } = state;
          //@ts-ignore
          if (debugCallbackId && window[debugCallbackId]) {
            //@ts-ignore
            const handler = window[debugCallbackId];
            handler({ operation: "stepIn" });
          }
        },
      },
      {
        code: "stepOut",
        title: "跳出当前方法(Ctrl+F11)",
        icon: <UploadIcon fontSize="small" />,
        disabled: true,
        active: false,
        click: (state: FrontendDebuggerState, active: boolean) => {
          const { debugCallbackId } = state;
          //@ts-ignore
          if (debugCallbackId && window[debugCallbackId]) {
            //@ts-ignore
            const handler = window[debugCallbackId];
            handler({ operation: "stepOut" });
          }
        },
      },
      {
        code: "disableAll",
        title: "停用所有规则(Ctrl+F8)",
        icon: <LabelOffIcon fontSize="small" />,
        disabled: false,
        active: false,
        click: (state: FrontendDebuggerState, active: boolean) => {
          setDisableAll(active);
        },
      },
      {
        code: "breakAll",
        title: "中断所有规则",
        icon: <DoneAllIcon fontSize="small" />,
        disabled: function (
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
        active: false,
        click: (state: FrontendDebuggerState, active: boolean) => {
          setBreakAll(active);
        },
      },
    ],
    expand: {
      monitor: true,
      breakpoint: true,
    },
  });
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
        dispatch(setDisableAll(true));
        setData({
          ...data,
          operations: updateOperation(
            { code: "disableAll", active: true },
            data.operations
          ),
        });
      },
    },
    {
      code: "enableAll",
      title: "启用所有断点",
      click: () => {
        dispatch(setDisableAll(false));
        setData({
          ...data,
          operations: updateOperation(
            { code: "disableAll", active: false },
            data.operations
          ),
        });
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
  const handleContextMenuClose = () => {
    setContextMenu({ mousePosition: null, breakpoint: undefined });
  };
  const menus = filterMenus(
    contextMenuItems,
    data.operations,
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
            {data.operations.map((operation) => {
              let disabled = operation.disabled;
              if (typeof disabled == "function") {
                disabled = disabled(operation, data.operations, state);
              }
              return (
                <OperationButton
                  key={operation.code}
                  title={operation.title}
                  active={operation.active}
                  disabled={disabled}
                  onClick={() => {
                    operation.click(state, !operation.active);
                  }}
                  icon={operation.icon}
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
                                    disabled={disableAll}
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
