import {
  Fragment,
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';
import {
  animated,
  useSpring,
} from 'react-spring';
import {
  Element,
  xml2js,
} from 'xml-js';

import PestControlIcon from '@mui/icons-material/PestControl';
import TreeItem, {
  treeItemClasses,
  TreeItemProps,
} from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import {
  alpha,
  styled,
} from '@mui/material/styles';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import { TransitionProps } from '@mui/material/transitions';
import Typography, { TypographyProps } from '@mui/material/Typography';

import { getFrontendMethod } from '../utils/RPCUtils';
import { uuid } from '../utils/StringUtils';
import {
  Breakpoint,
  Operations,
} from '../utils/Types';

interface FrontendMethodConfigTreeValue {
  componentCode: string;
  windowCode?: string;
  methodCode: string;
  ruleCode: string;
}

interface FrontendMethodConfigTreeProps {
  value?: FrontendMethodConfigTreeValue;
  currentMethod?: {
    componentCode: string;
    windowCode?: string;
    methodCode: string;
  };
  breakpoints?: Breakpoint[];
  operations: Operations;
  onBreakpointChanged?: (debuged: boolean, breakpoint: Breakpoint) => void;
  onSelectRuleChanged?: (node: {
    componentCode: string;
    methodCode: string;
    ruleCode: string;
    windowCode?: string;
  }) => void;
}

declare module "react" {
  interface CSSProperties {
    "--tree-view-color"?: string;
    "--tree-view-bg-color"?: string;
  }
}

type StyledTreeItemProps = TreeItemProps & {
  bgColor?: string;
  color?: string;
  labelText: string;
  type: "rule" | "if" | "else" | "foreach";
  labelDesc?: string;
  currentMethod?: {
    componentCode: string;
    windowCode?: string;
    methodCode: string;
  };
  ruleCode?: string;
  breakpoints?: Breakpoint[];
  disabledAllBreakpoint: boolean;
  onBreakpointChanged?: (debuged: boolean, breakpoint: Breakpoint) => void;
  debug?: boolean | { debug: boolean; condition: string };
};

function MinusSquare(props: SvgIconProps) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare(props: SvgIconProps) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}

function TransitionComponent(props: TransitionProps) {
  const style = useSpring({
    from: {
      opacity: 0,
      transform: "translate3d(20px,0,0)",
    },
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
    },
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

function DebugIcon(props: {
  type: "rule" | "if" | "else" | "foreach";
  value: boolean;
  disabled: boolean;
  onToggle: (debuged: boolean) => void;
}) {
  const { value, onToggle, disabled, type } = props;
  const attrs: TypographyProps = {
    variant: "caption",
    color: "inherit",
    align: "center",
    sx: {
      width: "50px",
    },
  };
  const btnAttrs: IconButtonProps = {
    disabled,
    onClick: () => {
      if (type == "rule") {
        onToggle(!value);
      }
    },
  };
  if (type != "rule") {
    return <Typography {...attrs}></Typography>;
  } else {
    return (
      <IconButton {...btnAttrs}>
        <PestControlIcon
          fontSize="small"
          sx={{ cursor: "pointer" }}
          color={value ? (disabled ? "disabled" : "primary") : "inherit"}
        />
      </IconButton>
    );
  }
}

function getBreakpointByNodeId(nodeId: string, breakpoints?: Breakpoint[]) {
  if (breakpoints) {
    return breakpoints.find((breakpoint) => {
      return (
        nodeId ==
        ruleInstanceToId(breakpoint.location.ruleCode, breakpoint.location)
      );
    });
  }
  return null;
}

function isDebuged(nodeId: string, breakpoints?: Breakpoint[]) {
  return !!getBreakpointByNodeId(nodeId, breakpoints);
}

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    //cursor: "default",
    //borderTopRightRadius: theme.spacing(2),
    //borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    "&.Mui-expanded": {
      fontWeight: theme.typography.fontWeightRegular,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.selected,
    },
    "&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: "var(--tree-view-color)",
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: "inherit",
      color: "inherit",
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

function StyledTreeItem(props: StyledTreeItemProps) {
  const {
    bgColor,
    color,
    breakpoints,
    labelText,
    labelDesc,
    debug,
    type,
    ruleCode,
    disabledAllBreakpoint,
    currentMethod,
    onBreakpointChanged,
    ...other
  } = props;
  const nodeId = props.nodeId;
  let disabled = disabledAllBreakpoint;
  if (!disabled) {
    const breakpoint = getBreakpointByNodeId(nodeId, breakpoints);
    disabled = breakpoint ? !breakpoint.enable : false;
  }
  return (
    <StyledTreeItemRoot
      TransitionComponent={TransitionComponent}
      label={
        <Box sx={{ display: "flex", alignItems: "center", p: 0.5, pr: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "inherit",
              flexGrow: 1,
            }}
          >
            {labelText}
          </Typography>
          <Tooltip title={labelDesc}>
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
              {labelDesc ? labelDesc : ""}
            </Typography>
          </Tooltip>
          <DebugIcon
            type={type}
            disabled={disabled}
            value={isDebuged(nodeId, breakpoints)}
            onToggle={(debuged: boolean) => {
              if (onBreakpointChanged && currentMethod && ruleCode) {
                onBreakpointChanged(debuged, {
                  enable: true,
                  location: { ...currentMethod, ruleCode },
                });
              }
            }}
          ></DebugIcon>
        </Box>
      }
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor,
      }}
      {...other}
    />
  );
}

interface TreeNode {
  id: string;
  label: string;
  type: "rule" | "if" | "else" | "foreach";
  desc?: string;
  ruleCode?: string;
  debug?: boolean | { debug: boolean; condition: string };
  children?: TreeNode[];
}

interface RuleInstance {
  condition: string;
  $: {
    ruleCode: string;
    instanceCode: string;
    instanceName: string;
    ruleName: string;
  };
}
interface Logic {
  ruleInstances: { ruleInstance: RuleInstance | RuleInstance[] };
  ruleSets: {
    ruleSet: {
      ruleRoute: {
        _: string;
      };
      ruleInstances: {
        ruleInstance: RuleInstance | RuleInstance[];
      };
    };
  };
}

function ruleInstanceToId(
  ruleCode: string,
  currentMethod: {
    componentCode: string;
    methodCode: string;
    windowCode?: string;
  }
) {
  const { componentCode, windowCode, methodCode } = currentMethod;
  return windowCode
    ? `window_rule_$_${componentCode}_$_${windowCode}_$_${methodCode}_$_${ruleCode}`
    : `component_rule_$_${componentCode}_$_${methodCode}_$_${ruleCode}`;
}

const dispatcher = {
  dispatch: function (
    element: Element,
    map: { [ruleCode: string]: RuleInstance },
    currentMethod: {
      componentCode: string;
      methodCode: string;
      windowCode?: string;
    }
  ): TreeNode {
    const name = element.name;
    //@ts-ignore
    const handler = dispatcher[name + ""];
    if (handler) {
      return handler(element, map, currentMethod);
    } else {
      throw Error("?????????????????????????????????" + name);
    }
  },
  if: function (
    element: Element,
    map: { [ruleCode: string]: RuleInstance },
    currentMethod: {
      componentCode: string;
      methodCode: string;
      windowCode?: string;
    }
  ): TreeNode {
    const elements = element.elements;
    let condition = "";
    let children: TreeNode[] = [];
    elements?.forEach((ele) => {
      const name = ele.name;
      if (name == "define") {
        const defines = ele.elements;
        defines?.forEach((define) => {
          const name = define.name;
          if (name == "expression") {
            if (
              define.elements &&
              define.elements[0] &&
              define.elements[0].text
            ) {
              condition = define.elements[0].text + "";
            }
          }
        });
      } else if (name == "sequence") {
        const elements = ele.elements;
        elements?.forEach((ele) => {
          children.push(dispatcher.dispatch(ele, map, currentMethod));
        });
      }
    });
    return {
      id: uuid(),
      label: "IF",
      type: "if",
      desc: condition,
      children,
    };
  },
  else: function (
    element: Element,
    map: { [ruleCode: string]: RuleInstance },
    currentMethod: {
      componentCode: string;
      methodCode: string;
      windowCode?: string;
    }
  ): TreeNode {
    const children: TreeNode[] = [];
    const elements = element.elements;
    elements?.forEach((ele) => {
      const name = ele.name;
      if (name == "sequence") {
        const elements = ele.elements;
        elements?.forEach((ele) => {
          children.push(dispatcher.dispatch(ele, map, currentMethod));
        });
      }
    });
    return {
      id: uuid(),
      label: "ELSE",
      type: "else",
      desc: "",
      children,
    };
  },
  evaluateRule: function (
    element: Element,
    map: { [ruleCode: string]: RuleInstance },
    currentMethod: {
      componentCode: string;
      methodCode: string;
      windowCode?: string;
    }
  ): TreeNode {
    const code = element.attributes?.code + "";
    return {
      id: ruleInstanceToId(code, currentMethod),
      type: "rule",
      ruleCode: code,
      label: map[code].$.instanceName || map[code].$.ruleName,
      desc: "",
    };
  },
  foreach: function (
    element: Element,
    map: { [ruleCode: string]: RuleInstance },
    currentMethod: {
      componentCode: string;
      methodCode: string;
      windowCode?: string;
    }
  ): TreeNode {
    const elements = element.elements;
    let entityCode = "",
      varCode = "";
    let children: TreeNode[] = [];
    elements?.forEach((ele) => {
      const name = ele.name;
      if (name == "define") {
        const defines = ele.elements;
        defines?.forEach((define) => {
          const name = define.name;
          if (name == "entityCode") {
            if (
              define.elements &&
              define.elements[0] &&
              define.elements[0].text
            ) {
              entityCode = define.elements[0].text + "";
            }
          } else if (name == "varCode") {
            if (
              define.elements &&
              define.elements[0] &&
              define.elements[0].text
            ) {
              varCode = define.elements[0].text + "";
            }
          }
        });
      } else if (name == "sequence") {
        const elements = ele.elements;
        elements?.forEach((ele) => {
          children.push(dispatcher.dispatch(ele, map, currentMethod));
        });
      }
    });
    return {
      id: uuid(),
      label: `Foreach(var ${varCode} in ${entityCode})`,
      type: "foreach",
      desc: "",
      children,
    };
  },
};

function ruleInstanceToMap(ruleInstances: {
  ruleInstance: RuleInstance | RuleInstance[];
}) {
  const map: { [instanceCode: string]: RuleInstance } = {};
  if (ruleInstances && ruleInstances.ruleInstance) {
    const instances = Array.isArray(ruleInstances.ruleInstance)
      ? ruleInstances.ruleInstance
      : [ruleInstances.ruleInstance];
    instances.forEach((inst) => {
      map[inst.$.instanceCode] = inst;
    });
  }
  return map;
}

function toTree(
  logic: Logic,
  currentMethod: {
    componentCode: string;
    methodCode: string;
    windowCode?: string;
  }
): TreeNode[] {
  const tree: TreeNode[] = [];
  if (logic) {
    let xmlStr = logic.ruleSets.ruleSet.ruleRoute._;
    if (xmlStr && xmlStr.trim()) {
      const map: { [ruleCode: string]: RuleInstance } = {
        ...ruleInstanceToMap(logic.ruleSets.ruleSet.ruleInstances),
        ...ruleInstanceToMap(logic.ruleInstances),
      };
      xmlStr = `<root>${xmlStr.trim()}</root>`;
      const json = xml2js(xmlStr, {
        trim: true,
        ignoreComment: true,
        alwaysChildren: true,
        alwaysArray: true,
      });
      const elements = json.elements[0].elements;
      elements?.forEach((ele: Element) => {
        tree.push(dispatcher.dispatch(ele, map, currentMethod));
      });
    }
  }
  return tree;
}

const getAllNodeIds = function (tree: TreeNode[]): string[] {
  let result: string[] = [];
  tree.forEach((node) => {
    result.push(node.id);
    const children = node.children;
    if (children && children.length > 0) {
      result = result.concat(getAllNodeIds(children));
    }
  });
  return result;
};

function FrontendMethodConfigTree(props: FrontendMethodConfigTreeProps) {
  const {
    value,
    breakpoints,
    onBreakpointChanged,
    onSelectRuleChanged,
    operations,
    currentMethod,
  } = props;
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
  const renderTreeChildren = (node: TreeNode, operations: Operations) => (
    <StyledTreeItem
      key={node.id}
      nodeId={node.id}
      id={node.id}
      type={node.type}
      labelText={node.label}
      ruleCode={node.ruleCode}
      labelDesc={node.desc}
      breakpoints={breakpoints}
      disabledAllBreakpoint={operations.disableAll.active}
      currentMethod={currentMethod}
      onBreakpointChanged={onBreakpointChanged}
      sx={{ textAlign: "left" }}
    >
      {Array.isArray(node.children)
        ? node.children.map((node) => renderTreeChildren(node, operations))
        : null}
    </StyledTreeItem>
  );
  const nav = useNavigate();
  const errHandler = (e: any) => {
    console.error(e);
    nav("/500");
  };
  useEffect(() => {
    if (currentMethod) {
      getFrontendMethod(currentMethod)
        .then((logic: any) => {
          try {
            const tree = toTree(logic, currentMethod);
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
    currentMethod
      ? `${currentMethod.componentCode}_$_${currentMethod.methodCode}_$_${currentMethod.windowCode}`
      : currentMethod,
  ]);
  useEffect(() => {
    if (value && currentMethod) {
      document
        .getElementById(ruleInstanceToId(value.ruleCode, currentMethod))
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [value]);
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
          <TreeView
            expanded={data.expanded}
            selected={
              value && currentMethod
                ? [ruleInstanceToId(value.ruleCode, currentMethod)]
                : []
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
          >
            {data.tree.map((node) => renderTreeChildren(node, operations))}
          </TreeView>
        </Card>
      </Box>
    </Fragment>
  );
}

export default FrontendMethodConfigTree;
