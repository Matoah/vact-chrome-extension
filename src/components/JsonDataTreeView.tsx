import {
  useEffect,
  useState,
} from 'react';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

import { scrollIntoView } from '../utils/DomUtils';
import { uuid } from '../utils/StringUtils';
import {
  arrayToTree,
  jsonPathToExpanded,
  jsonPathToNodeId,
  objectToTree,
} from '../utils/TreeUtils';
import { TreeNode } from '../utils/Types';

interface JsonDataTreeViewProps {
  json: Array<any> | {};
  expanded?: string[];
  selected?: string[];
  sx?: SxProps<Theme>;
}

export default function JsonDataTreeView(props: JsonDataTreeViewProps) {
  const { json, expanded, selected, sx } = props;
  const [data, setData] = useState<{
    expanded: string[];
    tree: TreeNode[];
    selected: string[];
  }>(() => {
    return {
      expanded: expanded ? jsonPathToExpanded("root", expanded) : [],
      selected: selected ? [jsonPathToNodeId("root", selected)] : [],
      tree: Array.isArray(json)
        ? arrayToTree("root", json)
        : objectToTree("root", json),
    };
  });
  const renderTreeChildren = (node: TreeNode) => (
    <TreeItem
      id={node.id}
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
    if (expanded) {
      setData((data) => {
        return {
          ...data,
          expanded: jsonPathToExpanded("root", expanded),
        };
      });
    }
  }, [expanded]);
  useEffect(() => {
    if (selected && selected.length > 0) {
      const nodeId = jsonPathToNodeId("root", selected);
      setData((data) => {
        return {
          ...data,
          selected: [nodeId],
        };
      });
      scrollIntoView(document.getElementById(nodeId));
    }
  }, [selected]);
  return (
    <TreeView
      sx={sx ? sx : {}}
      selected={data.selected}
      expanded={data.expanded}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      onNodeSelect={(evt: any, selected: any) => {
        setData((data) => {
          return {
            ...data,
            selected: [selected],
          };
        });
      }}
      onNodeToggle={(evt, expanded) => {
        setData(() => {
          return {
            ...data,
            expanded,
          };
        });
      }}
    >
      {data.tree.map((node: TreeNode) => renderTreeChildren(node))}
    </TreeView>
  );
}
