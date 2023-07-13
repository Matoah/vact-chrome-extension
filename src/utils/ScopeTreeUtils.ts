import { uuid } from './StringUtils';
import {
  FrontendScope,
  ScopeTreeNode,
  ScopeTreeSearchItem,
} from './Types';

const sortHandler = function (n1: ScopeTreeNode, n2: ScopeTreeNode) {
    let label1 = n1.label;
    label1 = typeof label1 =='string' ? label1:''
    let label2 = n2.label;
    label2 = typeof label2 =='string' ? label2:''
    return label1.localeCompare(label2);
  };

export function toScopeTree(scopes: Array<FrontendScope>): ScopeTreeNode[] {
  let tree: ScopeTreeNode[] = [];
  const map: { [id: string]: ScopeTreeNode } = {};
  scopes.forEach((scope) => {
    const { instanceId, type, componentCode, title, windowCode } = scope;
    map[instanceId] = {
      id:instanceId,
      type,
      componentCode,
      label: title,
      windowCode,
    };
  });
  scopes.forEach((scope)=>{
    const {pId,instanceId} = scope;
    const node = map[instanceId];
    if(typeof pId == "string"){
        const parentNode = map[pId];
        if(parentNode){
            let children = parentNode.children||[];
            children.push(node);
            children = children.sort(sortHandler)
            parentNode.children = children;
        }else{
            tree.push(node);
            tree = tree.sort(sortHandler);
        }
    }else{
        tree.push(node);
        tree = tree.sort(sortHandler);
    }
  });
  return tree;
}

export function toScopeTreeSearchItems(
  scopes: Array<FrontendScope>
): Array<ScopeTreeSearchItem> {
    const items:Array<ScopeTreeSearchItem> = [];
    scopes.forEach(scope=>{
        const {type,instanceId,title,componentCode,windowCode} = scope;
        items.push({
            id:uuid(),
            instanceId,
            label:title
        });
        items.push({
            id:uuid(),
            instanceId:scope.instanceId,
            label:type == "window" ? windowCode+"":componentCode
        });
    });
  return items;
}

export function getAllNodeIds(treeNodes: ScopeTreeNode[]): string[] {
    let result: string[] = [];
    treeNodes.forEach((node) => {
      result.push(node.id);
      const children = node.children;
      if (children && children.length > 0) {
        result = result.concat(getAllNodeIds(children));
      }
    });
    return result;
}

export function filterScopeTree(
  treeNodes: ScopeTreeNode[],
  search?: ScopeTreeSearchItem
): ScopeTreeNode[] {
    if(search){
        const nodes:ScopeTreeNode[] = [];
        for (let index = 0; index < treeNodes.length; index++) {
            const node = treeNodes[index];
            if(node.id == search.instanceId){
                const nd = Object.create(node);
                nd.children = [];
                nodes.push(nd);
                break;
            }else{
                const children = node.children;
                if(children&&children.length>0){
                    const result = filterScopeTree(children,search);
                    if(result.length>0){
                        const nd = Object.create(node);
                        nd.children = result;
                        nodes.push(nd);
                        return nodes;
                    }
                }
            }
        }
        return nodes;
    }else{
        return treeNodes;
    }
}

export function toScopeTreeNodeId(node:ScopeTreeNode|ScopeTreeSearchItem):string {
    //@ts-ignore
    return node.instanceId||node.id;
}

export function getScopeTreeNodeById(nodeId:string,treeNodes: ScopeTreeNode[]):ScopeTreeNode|null{
    for (let index = 0; index < treeNodes.length; index++) {
        const node = treeNodes[index];
        if(node.id == nodeId){
            return node;
        }else{
            const children = node.children;
            if(children&&children.length>0){
                const result = getScopeTreeNodeById(nodeId,children);
                if(result){
                    return result;
                }
            }
        }
    }
    return null;
}
