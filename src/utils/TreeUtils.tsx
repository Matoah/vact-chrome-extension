import { Fragment } from 'react';

import Clipboard from '../components/Clipboard';
import {
  isEmptyObject,
  isObject,
} from '../utils/ObjectUtils';
import { TreeNode } from './Types';

function StringLabel(params: { value: any }) {
    const { value } = params;
    return <span style={{ color: "#35c4d7" }}>{value}</span>;
  }
  
  function KeyLabel(params: { value: any }) {
    const { value } = params;
    return <span style={{ color: "#9aa0a6" }}>{value}</span>;
  }
  
  function IndentityLabel(params: { value: any }) {
    const { value } = params;
    return <span style={{ color: "#9980ff" }}>{value}</span>;
  }
  
  function ColonLabel() {
    return <span style={{ color: "#e8eaed" }}>:</span>;
  }
  
  function ObjectLabel(params: { value: any }) {
    const { value } = params;
    return <span style={{ color: "#e8eaed" }}>{value}</span>;
  }

  const resolveChar = function (title: any) {
    if (typeof title == "string") {
      return JSON.stringify(title);
    }
    return title;
  };

  const arrayToTree = function (prefix: string, array: any[]): TreeNode[] {
    const tree: TreeNode[] = [];
    if (array.length == 0) {
      tree.push({
        id: `${prefix}_$_emptyArray`,
        label: (
          <Clipboard
            value="[]"
            label={<ObjectLabel value="[]"></ObjectLabel>}
          ></Clipboard>
        ),
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
        label: isEmpty ? (
          <Clipboard
            value="[]"
            label={
              <Fragment>
                <KeyLabel value={key}></KeyLabel>
                <ColonLabel></ColonLabel>
                <ObjectLabel value="[]"></ObjectLabel>
              </Fragment>
            }
          ></Clipboard>
        ) : (
          <Clipboard
            value={val}
            label={<KeyLabel value={key}></KeyLabel>}
          ></Clipboard>
        ),
        type: "none",
        children: isEmpty ? undefined : arrayToTree(id, val),
      };
    } else if (isObject(val)) {
      const isEmpty = isEmptyObject(val);
      return {
        id,
        label: isEmpty ? (
          <Clipboard
            label={
              <Fragment>
                <KeyLabel value={key}></KeyLabel>
                <ColonLabel></ColonLabel>
                <ObjectLabel value="{}"></ObjectLabel>
              </Fragment>
            }
            value="{}"
          ></Clipboard>
        ) : (
          <Clipboard
            value={val}
            label={<KeyLabel value={key}></KeyLabel>}
          ></Clipboard>
        ),
        type: "none",
        children: isEmpty ? undefined : objectToTree(id, val),
      };
    } else {
      return {
        id,
        label: (
          <Clipboard
            value={val}
            label={
              <Fragment>
                <KeyLabel value={key}></KeyLabel>
                <ColonLabel></ColonLabel>
                {typeof val == "string" ? (
                  <StringLabel value={resolveChar(val)}></StringLabel>
                ) : (
                  <IndentityLabel value={val}></IndentityLabel>
                )}
              </Fragment>
            }
          ></Clipboard>
        ),
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
  interface Node{
    id:string,
    children?:Node[]
  }
  const getAllNodeIds = function(tree:Node[]){
    let result: string[] = [];
    tree.forEach((node) => {
      result.push(node.id);
      const children = node.children;
      if (children && children.length > 0) {
        result = result.concat(getAllNodeIds(children));
      }
    });
    return result;
  }

export { arrayToTree, getAllNodeIds, objectToTree };