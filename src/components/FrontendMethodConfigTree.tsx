import {
  Fragment,
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import {
  useDispatch,
  useSelector,
} from '../store';
import { getFrontendMethod } from '../utils/RPCUtils';
import {
  getAllNodeIds,
  getBreakpointByNodeId,
  isDebuged,
  ruleInstanceToId,
  toTree,
  TreeNode,
} from '../utils/RuleConfigTreeUtils';
import {
  Breakpoint,
  Operations,
} from '../utils/Types';
import CustomTreeView from './CustomTreeView';
import DebugIcon from './DebugIcon';
import MinusSquare from './MinusSquare';
import PlusSquare from './PlusSquare';

interface FrontendMethodConfigTreeValue {
  componentCode: string;
  windowCode?: string;
  methodCode: string;
  ruleCode: string;
}

interface FrontendMethodConfigTreeProps {
  operations: Operations;
  onBreakpointChanged?: (debuged: boolean, breakpoint: Breakpoint) => void;
  onSelectRuleChanged?: (node: {
    componentCode: string;
    methodCode: string;
    ruleCode: string;
    windowCode?: string;
  }) => void;
}

function FrontendMethodConfigTree(props: FrontendMethodConfigTreeProps) {
  const dispatch = useDispatch();
  const { method, rule, breakpoints } = useSelector(
    (state) => state.frontendDebugger
  );
  const { onBreakpointChanged, onSelectRuleChanged, operations } = props;

  const [data, setData] = useState<{
    current: null | string;
    tree: TreeNode[];
    expanded: string[];
  }>(() => {
    return {
      current: null,
      tree: [],
      expanded: [],
    };
  });
  const nav = useNavigate();
  const errHandler = (e: any) => {
    console.error(e);
    nav("/500");
  };
  useEffect(() => {
    if (method) {
      getFrontendMethod(method)
        .then((logic: any) => {
          try {
            const tree = toTree(logic, method);
            const expanded = getAllNodeIds(tree);
            setData({ ...data, tree, expanded });
          } catch (e) {
            errHandler(e);
          }
        })
        .catch(errHandler);
    } else {
      setData({ ...data, tree: [] });
    }
  }, [
    method
      ? `${method.componentCode}_$_${method.methodCode}_$_${method.windowCode}`
      : method,
  ]);
  useEffect(() => {
    if (rule && method) {
      document
        .getElementById(ruleInstanceToId(rule.code, method))
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [rule]);
  return (
    <Fragment>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        <Card sx={{ flex: 1, ml: 1, overflow: "auto" }}>
          <CustomTreeView
            tree={data.tree}
            expanded={data.expanded}
            selected={
              rule && method ? [ruleInstanceToId(rule.code, method)] : []
            }
            onNodeToggle={(evt, expanded) => {
              setData({
                ...data,
                expanded,
              });
            }}
            defaultCollapseIcon={<MinusSquare />}
            defaultExpandIcon={<PlusSquare />}
            defaultEndIcon={<div style={{ width: 24 }} />}
            labelTemplate={(pros, node) => {
              const nodeId = node.nodeId;
              let disabled = operations.disableAll.active;
              if (!disabled) {
                const breakpoint = getBreakpointByNodeId(nodeId, breakpoints);
                disabled = breakpoint ? !breakpoint.enable : false;
              }
              const ruleCode = node.ruleCode;
              return (
                <Box
                  sx={{ display: "flex", alignItems: "center", p: 0.5, pr: 0 }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "inherit",
                      flexGrow: 1,
                    }}
                  >
                    {node.label}
                  </Typography>
                  <Tooltip title={node.desc}>
                    <Typography
                      variant="caption"
                      color="inherit"
                      sx={{
                        width: "300px",
                        textTransform: "none",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {node.desc ? node.desc : ""}
                    </Typography>
                  </Tooltip>
                  <DebugIcon
                    type={node.type}
                    disabled={disabled}
                    value={isDebuged(node.nodeId, breakpoints)}
                    onToggle={(debuged: boolean) => {
                      if (onBreakpointChanged && method && ruleCode) {
                        onBreakpointChanged(debuged, {
                          enable: true,
                          location: { ...method, ruleCode },
                        });
                      }
                    }}
                  ></DebugIcon>
                </Box>
              );
            }}
            onNodeSelect={(evt: any, nodeId: any) => {
              if (onSelectRuleChanged) {
                const list = nodeId.split("_$_");
                if (list.length == 5) {
                  onSelectRuleChanged({
                    componentCode: list[1],
                    windowCode: list[2],
                    methodCode: list[3],
                    ruleCode: list[4],
                  });
                } else if (list.length == 4) {
                  onSelectRuleChanged({
                    componentCode: list[1],
                    methodCode: list[2],
                    ruleCode: list[3],
                  });
                }
              }
            }}
          ></CustomTreeView>
        </Card>
      </Box>
    </Fragment>
  );
}

export default FrontendMethodConfigTree;