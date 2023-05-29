import { useState } from 'react';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';

import {
  isEmptyObject,
  isObject,
} from '../utils/ObjectUtils';
import { uuid } from '../utils/StringUtils';
import { TreeNode } from '../utils/Types';

interface JsonDataTreeViewProps{
    json: Array<any>|{}
}

const resolveChar = function(title:any){
  if(typeof title == "string"){
    return `"${title}"`
  }
  return title;
}

const arrayToTree = function (prefix: string, array: any[]): TreeNode[] {
    const tree: TreeNode[] = [];
    if (array.length == 0) {
      tree.push({
        id: `${prefix}_$_emptyArray`,
        label: "[]",
        type: "none",
      });
    } else {
      for (let i = 0; i < array.length; i++) {
        const item = array[i];
        const id = `${prefix}_$_${i}`;
        tree.push(toTreeNode(id, i + "", item));
      }
    }
    return tree;
  };
  
  const toTreeNode = function (id: string, key: string, val: any): TreeNode {
    if (Array.isArray(val)) {
      const isEmpty = val.length == 0;
      return {
        id,
        label: isEmpty ? `${key}:[]` : key,
        type: "none",
        children: isEmpty ? undefined : arrayToTree(id, val),
      };
    } else if (isObject(val)) {
      const isEmpty = isEmptyObject(val);
      return {
        id,
        label: isEmpty ? `${key}:{}` : key,
        type: "none",
        children: isEmpty ? undefined : objectToTree(id, val),
      };
    } else {
      return {
        id,
        label: `${key}:${resolveChar(val)}`,
        type: "none",
      };
    }
  };
  
  const objectToTree = function (
    prefix: string,
    object: { [code: string]: any }
  ): TreeNode[] {
    const tree: TreeNode[] = [];
    if (isEmptyObject(object)) {
      tree.push({
        id: `${prefix}_$_emptyObject`,
        label: "",
        type: "none",
      });
    } else {
      for (let attr in object) {
        const val = object[attr];
        const id = `${prefix}_$_${attr}`;
        tree.push(toTreeNode(id, attr, val));
      }
    }
    return tree;
  };

export default function JsonDataTreeView(props:JsonDataTreeViewProps){
    const {json} = props;
    const [data, setData] = useState<{ expanded: string[]; tree: TreeNode[] }>({
      expanded: [],
      tree: Array.isArray(json) ? arrayToTree("root_$_",json):objectToTree("root_$_",json),
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