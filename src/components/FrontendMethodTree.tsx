import { Fragment, useEffect, useState } from "react";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import CallToActionIcon from "@mui/icons-material/CallToAction";
import FolderIcon from "@mui/icons-material/Folder";
import SchemaIcon from "@mui/icons-material/Schema";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import TreeItem, { treeItemClasses, TreeItemProps } from "@mui/lab/TreeItem";
import TreeView from "@mui/lab/TreeView";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import { SvgIconProps } from "@mui/material/SvgIcon";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { getFrontendMethods } from "../utils/RPCUtils";
import { notEmpty } from "../utils/StringUtils";

interface Method {
  componentCode: string;
  componentName: string;
  methodCode: string;
  methodName: string;
  windowCode?: string;
  windowName?: string;
}

interface FrontendMethodTreeProps {
  value?: Method;
  onNodeSelect?: (id: string) => void;
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
        (node) => node.id == toWindowId(data)
      );
      if (!windowNode) {
        windowNode = {
          id: toWindowId(data),
          label: windowName || "",
          type: "window",
        };
        componentWindows.push(windowNode);
      }
      const windowMethods = windowNode.children || [];
      windowMethods.push({
        id: toWindowMethodId(data),
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

function toNodeId(data: Method) {
  const { windowCode } = data;
  return windowCode ? toWindowMethodId(data) : toComponentMethodId(data);
}

function toWindowMethodId(data: Method) {
  const { componentCode, windowCode, methodCode } = data;
  return `${componentCode}_$_component_@_windows_$_${windowCode}_$_${methodCode}`;
}

function toComponentMethodId(data: Method) {
  const { componentCode, methodCode } = data;
  return `${componentCode}_$_component_@_methods_$_${methodCode}`;
}
function toWindowId(data: Method) {
  const { componentCode, windowCode } = data;
  return `${componentCode}_$_component_@_windows_$_${windowCode}`;
}

interface Option {
  code: string;
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
        code: componentCode,
        label: componentCode,
      });
      if (notEmpty(componentName)) {
        options.push({
          code: componentCode,
          label: componentName,
        });
      }
    }
    if (windowCode) {
      const windowId = toWindowId(data);
      if (tmp.indexOf(windowId) == -1) {
        options.push({
          code: windowId,
          label: windowCode,
        });
        if (notEmpty(windowName)) {
          options.push({
            code: windowId,
            label: windowName || "",
          });
        }
      }
    }
    const methodId = windowCode
      ? toWindowMethodId(data)
      : toComponentMethodId(data);
    if (tmp.indexOf(methodId) == -1) {
      options.push({
        code: methodId,
        label: methodCode,
      });
      if (notEmpty(methodName)) {
        options.push({
          code: methodId,
          label: methodName,
        });
      }
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
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    "&.Mui-expanded": {
      fontWeight: theme.typography.fontWeightRegular,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
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
    marginLeft: 0,
    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(2),
    },
  },
}));

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

const filter = function (tree: TreeNode[], search?: string) {
  if (search) {
    const result: TreeNode[] = [];
    tree.forEach((node) => {
      if (search.startsWith(node.id)) {
        result.push({
          ...node,
          children:
            node.id == search
              ? node.children
              : node.children
              ? filter(node.children, search)
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
  const { value, onNodeSelect } = props;
  const [data, setData] = useState<{
    search?: Option;
    currentId?: string;
    options: Option[];
    tree: TreeNode[];
    selected: string[];
  }>(() => {
    return {
      search: undefined,
      currentId: undefined,
      options: [],
      tree: [],
      selected: value ? [toNodeId(value)] : [],
    };
  });
  const renderTreeChildren = (node: TreeNode) => (
    <StyledTreeItem
      key={node.id}
      nodeId={node.id}
      labelText={node.label}
      highlight={data.search ? data.search.code == node.id : false}
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
  const tree = filter(data.tree, data.search ? data.search.code : undefined);
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
            value={data.search}
            sx={{ width: "100%" }}
            options={data.options}
            autoHighlight
            autoSelect
            onChange={(evt, option: any) => {
              setData({ ...data, search: option });
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
            selected={data.selected}
            defaultCollapseIcon={<ArrowDropDownIcon />}
            defaultExpandIcon={<ArrowRightIcon />}
            defaultEndIcon={<div style={{ width: 24 }} />}
            onNodeSelect={(evt: any, nodeId: any) => {
              if (
                typeof onNodeSelect == "function" &&
                nodeId != data.currentId
              ) {
                setData({ ...data, currentId: nodeId, selected: [nodeId] });
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
