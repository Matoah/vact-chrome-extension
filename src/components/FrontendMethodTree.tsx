import {
  Fragment,
  useEffect,
  useState,
} from 'react';

import {
  animated,
  useSpring,
} from 'react-spring';

import CallToActionIcon from '@mui/icons-material/CallToAction';
import FolderIcon from '@mui/icons-material/Folder';
import SchemaIcon from '@mui/icons-material/Schema';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import TreeItem, {
  treeItemClasses,
  TreeItemProps,
} from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import {
  alpha,
  styled,
} from '@mui/material/styles';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import TextField from '@mui/material/TextField';
import { TransitionProps } from '@mui/material/transitions';
import Typography from '@mui/material/Typography';

import { getFrontendMethods } from '../utils/RPCUtils';
import {
  notEmpty,
  uuid,
} from '../utils/StringUtils';

interface Method {
  componentCode: string;
  componentName: string;
  methodCode: string;
  methodName: string;
  windowCode?: string;
  windowName?: string;
}

interface FrontendMethodTreeProps {
  value?: { componentCode: string; methodCode?: string; windowCode?: string };
  filter?: Option;
  onNodeSelect?: (id: string) => void;
  onFilter?: (filter: Option) => void;
}

interface TreeNode {
  id: string;
  type: "component" | "window" | "method" | "catalog";
  label: string;
  children?: TreeNode[];
}

function toTree(datas: Array<Method>): TreeNode[] {
  const tree: TreeNode[] = [];
  const map: { [id: string]: TreeNode } = {};
  datas.forEach((data) => {
    const {
      componentCode,
      componentName,
      methodCode,
      methodName,
      windowCode,
      windowName,
    } = data;
    let componentNode = map[componentCode];
    if (!componentNode) {
      componentNode = {
        id: componentCode,
        label: componentName,
        type: "component",
      };
      map[componentCode] = componentNode;
      tree.push(componentNode);
    }
    if (windowCode) {
      //窗体方法
      let children = componentNode.children || [];
      let componentWindowNode = children.find(
        (node) => node.id == `${componentCode}_$_component_@_windows`
      );
      if (!componentWindowNode) {
        componentWindowNode = {
          id: `${componentCode}_$_component_@_windows`,
          label: "窗体",
          type: "catalog",
        };
        children.push(componentWindowNode);
      }
      const componentWindows = componentWindowNode.children || [];
      let windowNode = componentWindows.find(
        (node) => node.id == toWindowId({ componentCode, windowCode })
      );
      if (!windowNode) {
        windowNode = {
          id: toWindowId({ componentCode, windowCode }),
          label: windowName || "",
          type: "window",
        };
        componentWindows.push(windowNode);
      }
      const windowMethods = windowNode.children || [];
      windowMethods.push({
        id: toWindowMethodId({ componentCode, windowCode, methodCode }),
        label: methodName,
        type: "method",
      });
      windowNode.children = windowMethods;
      componentWindowNode.children = componentWindows;
      componentNode.children = children;
    } else {
      //构件方法
      const children = componentNode.children || [];
      let componentMethodNode = children.find(
        (node) => node.id == `${componentCode}_$_component_@_methods`
      );
      if (!componentMethodNode) {
        componentMethodNode = {
          id: `${componentCode}_$_component_@_methods`,
          label: "构件方法",
          type: "catalog",
        };
        children.push(componentMethodNode);
      }
      const componentMethods = componentMethodNode.children || [];
      componentMethods.push({
        id: toComponentMethodId(data),
        label: methodName,
        type: "method",
      });
      componentMethodNode.children = componentMethods;
      componentNode.children = children;
    }
  });
  return tree;
}

function toWindowMethodId(data: {
  componentCode: string;
  methodCode: string;
  windowCode: string;
}) {
  const { componentCode, windowCode, methodCode } = data;
  return `${componentCode}_$_component_@_windows_$_${windowCode}_$_window_@_methods_$_${methodCode}`;
}

function toComponentMethodId(data: {
  componentCode: string;
  methodCode: string;
}) {
  const { componentCode, methodCode } = data;
  return `${componentCode}_$_component_@_methods_$_${methodCode}`;
}
function toWindowId(data: { componentCode: string; windowCode: string }) {
  const { componentCode, windowCode } = data;
  return `${componentCode}_$_component_@_windows_$_${windowCode}`;
}

interface Option {
  code: string;
  componentCode: string;
  windowCode?: string;
  methodCode?: string;
  label: string;
}

const toOptions = function (datas: Array<Method>): Option[] {
  const options: Option[] = [];
  const tmp: string[] = [];
  datas.forEach((data) => {
    const {
      componentCode,
      componentName,
      methodCode,
      methodName,
      windowCode,
      windowName,
    } = data;
    if (tmp.indexOf(componentCode) == -1) {
      tmp.push(componentCode);
      options.push({
        code: uuid(),
        componentCode,
        label: componentCode,
      });
      if (notEmpty(componentName)) {
        options.push({
          code: uuid(),
          componentCode,
          label: componentName,
        });
      }
    }
    if (windowCode) {
      const windowId = toWindowId({ componentCode, windowCode });
      if (tmp.indexOf(windowId) == -1) {
        tmp.push(windowId);
        options.push({
          code: uuid(),
          componentCode,
          windowCode,
          label: windowCode,
        });
        if (notEmpty(windowName)) {
          options.push({
            code: uuid(),
            componentCode,
            windowCode,
            label: windowName || "",
          });
        }
      }
    }
    options.push({
      code: uuid(),
      componentCode,
      windowCode,
      methodCode,
      label: methodCode,
    });
    if (notEmpty(methodName)) {
      options.push({
        code: uuid(),
        componentCode,
        windowCode,
        methodCode,
        label: methodName,
      });
    }
  });
  return options;
};
declare module "react" {
  interface CSSProperties {
    "--tree-view-color"?: string;
    "--tree-view-bg-color"?: string;
  }
}

type StyledTreeItemProps = TreeItemProps & {
  bgColor?: string;
  color?: string;
  labelIcon: React.ElementType<SvgIconProps>;
  highlight?: boolean;
  labelInfo?: string;
  labelText: string;
};

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    cursor: "default",
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

function StyledTreeItem(props: StyledTreeItemProps) {
  const {
    bgColor,
    color,
    labelIcon: LabelIcon,
    labelText,
    highlight,
    ...other
  } = props;
  return (
    <StyledTreeItemRoot
      TransitionComponent={TransitionComponent}
      label={
        <Box sx={{ display: "flex", alignItems: "center", p: 0.5, pr: 0 }}>
          <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
          <Typography
            variant="body2"
            sx={{
              fontWeight: "inherit",
              flexGrow: 1,
            }}
          >
            {highlight ? (
              <Typography
                component="span"
                sx={{
                  backgroundColor: "#ff9632",
                  color: "black",
                  wordBreak: "break-all",
                }}
              >
                {labelText}
              </Typography>
            ) : (
              labelText
            )}
          </Typography>
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

const optionToTreeNodeId = function (option: {
  componentCode: string;
  windowCode?: string;
  methodCode?: string;
}) {
  const { componentCode, windowCode, methodCode } = option;
  if (windowCode) {
    if (methodCode) {
      return toWindowMethodId({ componentCode, windowCode, methodCode });
    } else {
      return toWindowId({ componentCode, windowCode });
    }
  } else {
    if (methodCode) {
      return toComponentMethodId({ componentCode, methodCode });
    } else {
      return componentCode;
    }
  }
};

const filterTree = function (tree: TreeNode[], filter?: Option) {
  if (filter) {
    const result: TreeNode[] = [];
    const key = optionToTreeNodeId(filter);
    tree.forEach((node) => {
      if (key.startsWith(node.id)) {
        result.push({
          ...node,
          children:
            node.id == key
              ? node.children
              : node.children
              ? filterTree(node.children, filter)
              : [],
        });
      }
    });
    return result;
  } else {
    return tree;
  }
};

function FrontendMethodTree(props: FrontendMethodTreeProps) {
  const { value, filter, onFilter, onNodeSelect } = props;
  const [data, setData] = useState<{
    options: Option[];
    tree: TreeNode[];
  }>(() => {
    return {
      options: [],
      tree: [],
    };
  });
  const renderTreeChildren = (node: TreeNode) => (
    <StyledTreeItem
      key={node.id}
      nodeId={node.id}
      labelText={node.label}
      highlight={filter ? optionToTreeNodeId(filter) == node.id : false}
      labelIcon={
        node.type == "component"
          ? CallToActionIcon
          : node.type == "catalog"
          ? FolderIcon
          : node.type == "window"
          ? ViewTimelineIcon
          : SchemaIcon
      }
      sx={{ textAlign: "left" }}
    >
      {Array.isArray(node.children)
        ? node.children.map((node) => renderTreeChildren(node))
        : null}
    </StyledTreeItem>
  );
  useEffect(() => {
    getFrontendMethods()
      .then((datas) => {
        setData({ ...data, tree: toTree(datas), options: toOptions(datas) });
      })
      .catch();
  }, []);
  const expanded = getAllNodeIds(data.tree);
  const tree = filterTree(data.tree, filter);
  return (
    <Fragment>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
        }}
      >
        <Box sx={{ display: "flex", mb: 1 }}>
          <Autocomplete
            value={filter}
            sx={{ width: "100%" }}
            options={data.options}
            autoHighlight
            autoSelect
            onChange={(evt, option: any) => {
              if (onFilter) {
                onFilter(option);
              }
            }}
            getOptionLabel={(option) => option.label}
            renderOption={(props, option) => {
              return (
                <ListItem disablePadding {...props} key={option.code}>
                  <ListItemButton>
                    <ListItemText primary={option.label} />
                  </ListItemButton>
                </ListItem>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="搜索构件、窗体、方法"
                inputProps={{
                  ...params.inputProps,
                  autoComplete: "new-password", // disable autocomplete and autofill
                }}
              />
            )}
          />
        </Box>
        <Card sx={{ flex: 1 }}>
          <TreeView
            expanded={expanded}
            selected={value ? [optionToTreeNodeId(value)] : []}
            defaultCollapseIcon={<MinusSquare />}
            defaultExpandIcon={<PlusSquare />}
            defaultEndIcon={<div style={{ width: 24 }} />}
            onNodeSelect={(evt: any, nodeId: any) => {
              //setData({ ...data, currentId: nodeId, selected: [nodeId] });
              if (onNodeSelect) {
                onNodeSelect(nodeId);
              }
            }}
          >
            {tree.map((node) => renderTreeChildren(node))}
          </TreeView>
        </Card>
      </Box>
    </Fragment>
  );
}

export default FrontendMethodTree;
