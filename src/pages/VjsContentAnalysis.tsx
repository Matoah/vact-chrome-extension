import {
  Fragment,
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';

import Navigator from '../components/Navigator';
import { toFileSize } from '../utils/NumberUtils';
import {
  isEmptyObject,
  isObject,
} from '../utils/ObjectUtils';
import {
  getComponentMetadata,
  getWindowMetadata,
} from '../utils/RPCUtils';
import { uuid } from '../utils/StringUtils';
import { TreeNode } from '../utils/Types';
import {
  getCodeFromComponeentVjsName,
  getCodeFromWindowVjsName,
  isComponentSchemVjs,
  isWindowSchemaVjs,
} from '../utils/VjsUtils';

interface VjsContentAnalysisProps {}

const resolveChar = function (title: any) {
  if (typeof title == "string") {
    return JSON.stringify(title);
  }
  return title;
};

function StringLabel(params: { value: any }) {
  const { value } = params;
  return <span style={{ color: "#35c4d7" }}>{value}</span>;
}

function KeyLabel(params: { value: any }) {
  const { value } = params;
  return <span style={{ color: "#9aa0a6" }}>{value}</span>;
}

function ColonLabel() {
  return <span style={{ color: "#e8eaed" }}>:</span>;
}

function IndentityLabel(params: { value: any }) {
  const { value } = params;
  return <span style={{ color: "#9980ff" }}>{value}</span>;
}


function getMetadata(vjsName: string) {
  if (isWindowSchemaVjs(vjsName)) {
    const { componentCode, windowCode } = getCodeFromWindowVjsName(vjsName);
    return getWindowMetadata(componentCode, windowCode);
  } else if (isComponentSchemVjs(vjsName)) {
    const componentCode = getCodeFromComponeentVjsName(vjsName);
    return getComponentMetadata(componentCode);
  } else {
    return new Promise((resolve)=>{
      resolve({});
    });
  }
}

interface JsonDataTreeViewProps {
  json: Array<any> | {};
}

const toTreeNode = function (id: string, key: string, val: any): TreeNode {
  if (Array.isArray(val)) {
    const isEmpty = val.length == 0;
    return {
      id,
      label: (
        <Fragment>
          <KeyLabel value={key}></KeyLabel>
          <ColonLabel></ColonLabel>
          <IndentityLabel
            value={toFileSize(JSON.stringify(val).length)}
          ></IndentityLabel>
        </Fragment>
      ),
      type: "none",
      children: isEmpty ? undefined : arrayToTree(id, val),
    };
  } else if (isObject(val)) {
    const isEmpty = isEmptyObject(val);
    return {
      id,
      label: (
        <Fragment>
          <KeyLabel value={key}></KeyLabel>
          <ColonLabel></ColonLabel>
          <IndentityLabel
            value={toFileSize(JSON.stringify(val).length)}
          ></IndentityLabel>
        </Fragment>
      ),
      type: "none",
      children: isEmpty ? undefined : objectToTree(id, val),
    };
  } else {
    return {
      id,
      label: (
          <Fragment>
            <KeyLabel value={key}></KeyLabel>
            <ColonLabel></ColonLabel>
            {typeof val == "string" ? (
                  <StringLabel value={resolveChar(val)}></StringLabel>
                ) : (
                  <IndentityLabel value={val}></IndentityLabel>
                )}
            <IndentityLabel value={"  "+(val==null ? "0 B":toFileSize((val+"").length))}></IndentityLabel>
          </Fragment>
      ),
      type: "none",
    };
  }
};

const arrayToTree = function (prefix: string, array: any[]): TreeNode[] {
  const tree: TreeNode[] = [];
  if (array.length == 0) {
    tree.push({
      id: `${prefix}_$_emptyArray`,
      label: (<StringLabel value={toFileSize(JSON.stringify(array).length)}></StringLabel>),
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

function JsonDataTreeView(props: JsonDataTreeViewProps) {
  const { json } = props;
  const [data, setData] = useState<{ expanded: string[]; tree: TreeNode[] }>({
    expanded: [],
    tree: Array.isArray(json)
      ? arrayToTree("root_$_", json)
      : objectToTree("root_$_", json),
  });
  useEffect(()=>{
    setData({
      expanded: [],
      tree: Array.isArray(json)
      ? arrayToTree("root_$_", json)
      : objectToTree("root_$_", json),
    });
  },[json]);
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

function VjsContentAnalysis(pros: VjsContentAnalysisProps) {
  const params = useParams();
  const vjsName = params.vjsName;
  const [metadata,setMetadata] = useState({});
  const nav = useNavigate();
  const errHandler = (e: any) => {
    console.error(e);
    nav("/500");
  };
  useEffect(()=>{
    if(typeof vjsName == "string"){
      getMetadata(vjsName).then((data:any)=>setMetadata(data)).catch(e=>errHandler(e));
    }
  },[vjsName]);
  return <Fragment><JsonDataTreeView json={metadata}></JsonDataTreeView><Navigator/></Fragment>;
}

export default VjsContentAnalysis;
