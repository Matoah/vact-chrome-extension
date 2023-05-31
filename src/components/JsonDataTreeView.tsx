import { useState } from 'react';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';

import { uuid } from '../utils/StringUtils';
import {
  arrayToTree,
  objectToTree,
} from '../utils/TreeUtils';
import { TreeNode } from '../utils/Types';

interface JsonDataTreeViewProps {
  json: Array<any> | {};
}


export default function JsonDataTreeView(props: JsonDataTreeViewProps) {
  const { json } = props;
  const [data, setData] = useState<{ expanded: string[]; tree: TreeNode[] }>({
    expanded: [],
    tree: Array.isArray(json)
      ? arrayToTree("root_$_", json)
      : objectToTree("root_$_", json),
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
