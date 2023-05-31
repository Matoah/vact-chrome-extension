import {
  useEffect,
  useState,
} from 'react';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';

import { useSelector } from '../store';
import { isEmptyObject } from '../utils/ObjectUtils';
import {
  getComponentDebugInfo,
  getRuleDebugInfo,
  getRulesetDebugInfo,
  getWindowDebugInfo,
} from '../utils/RPCUtils';
import { uuid } from '../utils/StringUtils';
import { objectToTree } from '../utils/TreeUtils';
import {
  Rule,
  TreeNode,
} from '../utils/Types';

const getRuleTree = async function (debug: Rule, expanded: string[]) {
  const id = "debug_$_data_$_rule";
  let children = undefined;
  if (expanded.indexOf(id) != -1) {
    const ruleDebug = await getRuleDebugInfo();
    if (ruleDebug) {
      children = objectToTree(id, ruleDebug);
    }
  }
  return [
    {
      id,
      label: "规则",
      type: "ruleset",
      isFolder: true,
      children,
    },
  ];
};

const getRuleSetTree = async function (debug: Rule, expanded: string[]) {
  const id = "debug_$_data_$_ruleset";
  let children = undefined;
  if (expanded.indexOf(id) != -1) {
    const rulesetDebug = await getRulesetDebugInfo();
    if (rulesetDebug && !isEmptyObject(rulesetDebug)) {
      children = objectToTree(id, rulesetDebug);
    }
  }
  return [
    {
      id,
      label: "方法",
      type: "ruleset",
      isFolder: true,
      children,
    },
  ];
};

const getWindowTree = async function (debug: Rule, expanded: string[]) {
  const id = "debug_$_data_$_window";
  let children = undefined;
  if (expanded.indexOf(id) != -1) {
    const windowDebug = await getWindowDebugInfo();
    if (windowDebug) {
      children = objectToTree(id, windowDebug);
    }
  }
  return [
    {
      id,
      label: "窗体",
      type: "none",
      isFolder: true,
      children,
    },
  ];
};

const getComponentTree = async function (debug: Rule, expanded: string[]) {
  const id = "debug_$_data_$_component";
  let children = undefined;
  if (expanded.indexOf(id) != -1) {
    const windowDebug = await getComponentDebugInfo();
    if (windowDebug) {
      children = objectToTree(id, windowDebug);
    }
  }
  return [
    {
      id,
      label: "构件",
      isFolder: true,
      type: "component",
      children,
    },
  ];
};

const toTree = async function (expanded: string[], debug?: Rule) {
  if (debug) {
    const method = debug.method;
    const windowCode = method.windowCode;
    let tree: TreeNode[] = await getRuleTree(debug, expanded);
    const rulesetTree = await getRuleSetTree(debug, expanded);
    if (rulesetTree) {
      tree = tree.concat(rulesetTree);
    }
    if (windowCode) {
      const windowTree = await getWindowTree(debug, expanded);
      if (windowTree) {
        tree = tree.concat(windowTree);
      }
    }
    const componentTree = await getComponentTree(debug, expanded);
    if (componentTree) {
      tree = tree.concat(componentTree);
    }
    return tree;
  }
  return [];
};

const getNode = function (nodeId: string, tree: TreeNode[]) {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id == nodeId) {
      return node;
    } else {
      const children = node.children;
      if (children && children.length > 0) {
        const n = getNode(nodeId, children);
        if (n) {
          return node;
        }
      }
    }
  }
  return null;
};

const getExpandNode = function (
  newExpanded: string[],
  expanded: string[],
  tree: TreeNode[]
) {
  if (newExpanded.length > expanded.length) {
    for (let i = 0; i < newExpanded.length; i++) {
      const nodeId = newExpanded[i];
      if (expanded.indexOf(nodeId) == -1) {
        return getNode(nodeId, tree);
      }
    }
  }
  return null;
};

function DebugDataTree() {
  const { debug } = useSelector((state) => state.frontendDebugger);
  const [data, setData] = useState<{ expanded: string[]; tree: TreeNode[] }>({
    expanded: [],
    tree: [],
  });
  const renderTreeChildren = (node: TreeNode) => (
    <TreeItem
      key={node.id}
      nodeId={node.id}
      label={node.label}
      sx={{ textAlign: "left" }}
    >
      {Array.isArray(node.children) && node.children.length > 0 ? (
        node.children.map((node) => renderTreeChildren(node))
      ) : node.isFolder ? (
        <TreeItem key={uuid()} label="" nodeId={uuid()}></TreeItem>
      ) : null}
    </TreeItem>
  );
  useEffect(() => {
    (async () => {
      const tree = await toTree(data.expanded, debug?.rule);
      setData({
        ...data,
        tree,
      });
    })();
  }, [debug, data.expanded]);
  return (
    <TreeView
      expanded={data.expanded}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      onNodeToggle={(evt, expanded) => {
        setData({
          ...data,
          expanded,
        });
      }}
    >
      {data.tree.map((node: TreeNode) => renderTreeChildren(node))}
    </TreeView>
  );
}

export default DebugDataTree;
