import {
  Fragment,
  useEffect,
  useState,
} from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';

import { getFrontendMethods } from '../utils/RPCUtils';
import { notEmpty } from '../utils/StringUtils';

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

const renderTreeChildren = (node: TreeNode) => (
  <TreeItem
    key={node.id}
    nodeId={node.id}
    label={node.label}
    sx={{ textAlign: "left" }}
  >
    {Array.isArray(node.children)
      ? node.children.map((node) => renderTreeChildren(node))
      : null}
  </TreeItem>
);

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

function FrontendMethodTree(props: FrontendMethodTreeProps) {
  const { value } = props;
  const [data, setData] = useState(() => {
    return {
      search: "",
      datas: [],
    };
  });
  const tree = toTree(data.datas);
  const options = toOptions(data.datas);
  useEffect(() => {
    getFrontendMethods()
      .then((datas) => {
        setData({ ...data, datas });
      })
      .catch();
  }, []);
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
            disableClearable
            value={data.search}
            sx={{ width: "100%" }}
            options={options}
            autoHighlight
            autoSelect
            onChange={(evt, option) => {
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
            defaultCollapseIcon={<ArrowDropDownIcon />}
            defaultExpandIcon={<ArrowRightIcon />}
            defaultEndIcon={<div style={{ width: 24 }} />}
          >
            {tree.map((node) => renderTreeChildren(node))}
          </TreeView>
        </Card>
      </Box>
    </Fragment>
  );
}

export default FrontendMethodTree;
