import {
  ReactNode,
  useEffect,
} from 'react';

import TreeItem, { TreeItemProps } from '@mui/lab/TreeItem';
import TreeView, { TreeViewProps } from '@mui/lab/TreeView';

import { scrollIntoView } from '../utils/DomUtils';
import TransitionComponent from './TransitionComponent';

type StyledTreeItemProps = TreeItemProps & {
  node: any;
  labelTemplate: (props: TreeItemProps, node: any) => ReactNode;
};

function StyledTreeItem(props: StyledTreeItemProps) {
  const { labelTemplate, node, ...other } = props;
  return (
    <TreeItem
      TransitionComponent={TransitionComponent}
      label={labelTemplate(other, node)}
      {...other}
    />
  );
}

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

type CustomTreeViewProps = TreeViewProps & {
  tree: TreeNode[];
  labelTemplate: (props: TreeItemProps, node: any) => ReactNode;
};

function CustomTreeView(pros: CustomTreeViewProps) {
  const { tree, labelTemplate, ...other } = pros;
  const selected = pros.selected;
  const renderTreeChildren = (node: TreeNode) => (
    <StyledTreeItem
      key={node.id}
      id={node.id}
      nodeId={node.id}
      node={node}
      labelTemplate={labelTemplate}
      sx={{ textAlign: "left" }}
    >
      {Array.isArray(node.children)
        ? node.children.map((node) => renderTreeChildren(node))
        : null}
    </StyledTreeItem>
  );
  useEffect(() => {
    if (selected && selected.length > 0) {
      scrollIntoView(document.getElementById(selected[0]));
    }
  }, [selected]);
  return (
    <TreeView {...other}>
      {tree.map((node: TreeNode) => renderTreeChildren(node))}
    </TreeView>
  );
}

export default CustomTreeView;
export { CustomTreeView, type TreeNode };
