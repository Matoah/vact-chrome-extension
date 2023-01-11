import {
  Fragment,
  ReactNode,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

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
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { isEqual } from '../utils/BreakpointUtils';
import {
  clearBreakpoint,
  markBreakAllRule,
  markIgnoreBreakpoints,
  removeBreakpoint,
  unmarkBreakAllRule,
  unmarkIgnoreBreakpoints,
  updateBreakpoint,
} from '../utils/RPCUtils';
import {
  Breakpoint,
  Operations,
} from '../utils/Types';

interface FrontendDebugAttrPanelProps {
  value?: {
    componentCode: string;
    methodCode: string;
    ruleCode: string;
    windowCode?: string;
  };
  breakpoints?: Breakpoint[];
  operations: Operations;
  onBreakpointLocation?: (breakpoint: Breakpoint) => void;
  handleOperation: (params: { operation: string }) => void;
  refresh: () => void;
}

const StyledBox = styled(Box)(({ theme }) => ({
  boxShadow: `0px 0px 2px #996a6a`,
  //borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.4)}`,
}));

const StyledButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

function OperationButton(props: {
  active: boolean;
  title: string;
  disabled: boolean;
  icon: ReactNode;
  onClick?: (active: boolean) => void;
}) {
  const { active, title, icon, disabled, onClick } = props;
  const chickHandler = () => {
    if (onClick) {
      onClick(!active);
    }
  };
  return active && !disabled ? (
    <Tooltip title={title}>
      <StyledButton disabled={disabled} onClick={chickHandler}>
        {icon}
      </StyledButton>
    </Tooltip>
  ) : (
    <IconButton disabled={disabled} onClick={chickHandler}>
      {icon}
    </IconButton>
  );
}

const breakpointToKey = function (breakpoint: Breakpoint) {
  const { location } = breakpoint;
  const { componentCode, windowCode, methodCode, ruleCode } = location;
  return windowCode
    ? `window_breakpoint_$_${componentCode}_$_${windowCode}_$_${methodCode}_$_${ruleCode}`
    : `component_breakpoint_$_${componentCode}_$_${methodCode}_$_${ruleCode}`;
};

function FrontendDebugAttrPanel(props: FrontendDebugAttrPanelProps) {
  const {
    breakpoints,
    refresh,
    onBreakpointLocation,
    operations,
    value,
    handleOperation,
  } = props;
  const [contextMenu, setContextMenu] = useState<{
    mousePosition: { mouseX: number; mouseY: number } | null;
    breakpoint?: Breakpoint;
  }>({ mousePosition: null, breakpoint: undefined });
  const [data, setData] = useState({
    expand: {
      monitor: true,
      breakpoint: true,
    },
  });
  const nav = useNavigate();
  const errHandler = (e: any) => {
    console.error(e);
    nav("/500");
  };
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
  const handleContextMenuClose = (
    type?:
      | "remove"
      | "position"
      | "disable"
      | "disableAll"
      | "clear"
      | "clearOther"
  ) => {
    if (type && contextMenu.breakpoint) {
      const callback = () => {
        refresh();
      };
      const breakpoint = contextMenu.breakpoint;
      if (type == "remove") {
        removeBreakpoint(breakpoint).then(callback).catch(errHandler);
      } else if (type == "position") {
        if (onBreakpointLocation) {
          onBreakpointLocation(contextMenu.breakpoint);
        }
      } else if (type == "disable") {
        breakpoint.enable = false;
        updateBreakpoint(breakpoint).then(callback).catch(errHandler);
      } else if (type == "disableAll") {
        markIgnoreBreakpoints().then(callback).catch(errHandler);
      } else if (type == "clear") {
        clearBreakpoint().then(callback).catch(errHandler);
      } else if (type == "clearOther") {
        const removed: Breakpoint[] = [];
        breakpoints?.forEach((bp) => {
          if (!isEqual(bp, breakpoint)) {
            removed.push(bp);
          }
        });
        if (removed.length > 0) {
          removeBreakpoint(removed).then(callback).catch(errHandler);
        }
      }
    }
    setContextMenu({ mousePosition: null, breakpoint: undefined });
  };
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
            <OperationButton
              title="执行到下一个断点(F8)"
              active={operations.play.active}
              disabled={!value || operations.play.disabled}
              onClick={() => {
                handleOperation({ operation: "nextBreakpoint" });
              }}
              icon={<FastForwardIcon fontSize="small" />}
            />
            <OperationButton
              title="执行到下一个规则(F10)"
              active={operations.next.active}
              disabled={!value || operations.next.disabled}
              onClick={() => {
                handleOperation({ operation: "nextRule" });
              }}
              icon={<SkipNextIcon fontSize="small" />}
            />
            <OperationButton
              title="进入当前方法(F11)"
              active={operations.stepIn.active}
              disabled={operations.stepIn.disabled}
              onClick={() => {
                handleOperation({ operation: "stepIn" });
              }}
              icon={<DownloadIcon fontSize="small" />}
            />
            <OperationButton
              title="跳出当前方法(Ctrl+F11)"
              active={operations.stepOut.active}
              disabled={operations.stepOut.disabled}
              onClick={() => {
                handleOperation({ operation: "stepOut" });
              }}
              icon={<UploadIcon fontSize="small" />}
            />
            <OperationButton
              title="停用所有规则(Ctrl+F8)"
              active={operations.disableAll.active}
              disabled={operations.disableAll.disabled}
              onClick={(ignoreAll: boolean) => {
                if (ignoreAll) {
                  markIgnoreBreakpoints().then(refresh).catch(errHandler);
                } else {
                  unmarkIgnoreBreakpoints().then(refresh).catch(errHandler);
                }
              }}
              icon={<LabelOffIcon fontSize="small" />}
            />
            <OperationButton
              title="中断所有规则"
              active={operations.breakAll.active}
              disabled={
                operations.disableAll.active || operations.breakAll.disabled
              }
              onClick={(breakAll: boolean) => {
                if (breakAll) {
                  markBreakAllRule().then(refresh).catch(errHandler);
                } else {
                  unmarkBreakAllRule().then(refresh).catch(errHandler);
                }
              }}
              icon={<DoneAllIcon fontSize="small" />}
            />
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
                                  if (onBreakpointLocation) {
                                    onBreakpointLocation(breakpoint);
                                  }
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
                                    disabled={operations.disableAll.active}
                                    checked={breakpoint.enable}
                                    onChange={(evt, checked) => {
                                      updateBreakpoint({
                                        enable: checked,
                                        location: breakpoint.location,
                                      })
                                        .then(() => {
                                          refresh();
                                        })
                                        .catch(errHandler);
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
        <MenuItem
          onClick={() => {
            handleContextMenuClose("remove");
          }}
        >
          移除断点
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleContextMenuClose("position");
          }}
        >
          显示位置
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleContextMenuClose("disable");
          }}
        >
          停用断点
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleContextMenuClose("disableAll");
          }}
        >
          禁用所有断点
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleContextMenuClose("clear");
          }}
        >
          删除所有断点
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleContextMenuClose("clearOther");
          }}
        >
          删除其他断点
        </MenuItem>
      </Menu>
    </Fragment>
  );
}

export default FrontendDebugAttrPanel;
