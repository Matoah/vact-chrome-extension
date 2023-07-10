import {
  ReactNode,
  useEffect,
} from 'react';

import TreeItem, {
  treeItemClasses,
  TreeItemProps,
} from '@mui/lab/TreeItem';
import TreeView, { TreeViewProps } from '@mui/lab/TreeView';
import {
  alpha,
  styled,
} from '@mui/material/styles';

import TransitionComponent from './TransitionComponent';

const isInViewPort = function (element: any) {
  const viewWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const { top, right, bottom, left } = element.getBoundingClientRect();

  return top >= 0 && left >= 0 && right <= viewWidth && bottom <= viewHeight;
};

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

type StyledTreeItemProps = TreeItemProps & {
  node: any;
  labelTemplate: (props: TreeItemProps, node: any) => ReactNode;
};

function StyledTreeItem(props: StyledTreeItemProps) {
  const { labelTemplate, node, ...other } = props;
  return (
    <StyledTreeItemRoot
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
      const dom = document.getElementById(selected[0]);
      if (dom && !isInViewPort(dom)) {
        dom.scrollIntoView({ behavior: "smooth" });
      }
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
