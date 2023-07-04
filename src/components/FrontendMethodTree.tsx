import {
  Fragment,
  ReactNode,
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import CallToActionIcon from '@mui/icons-material/CallToAction';
import FolderIcon from '@mui/icons-material/Folder';
import SchemaIcon from '@mui/icons-material/Schema';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { setMethod } from '../slices/fontendDebugger';
import {
  useDispatch,
  useSelector,
} from '../store';
import {
  on,
  un,
} from '../utils/DevTools';
import {
  filterMethodTree,
  getAllNodeIds,
  toMethodTree,
  toMethodTreeNodeId,
  toMethodTreeSearchItems,
} from '../utils/MethodTreeUtils';
import { getFrontendMethods } from '../utils/RPCUtils';
import {
  MethodTreeNode,
  MethodTreeSearchItem,
} from '../utils/Types';
import CustomTreeView from './CustomTreeView';
import MinusSquare from './MinusSquare';
import PlusSquare from './PlusSquare';

interface FrontendMethodTreeProps {}

function FrontendMethodTree(props: FrontendMethodTreeProps) {
  const dispatch = useDispatch();
  const { method } = useSelector((state) => state.frontendDebugger);
  const [data, setData] = useState<{
    methodTree: MethodTreeNode[];
    searchItems: MethodTreeSearchItem[];
    expanded: string[];
    search?: MethodTreeSearchItem;
  }>({
    methodTree: [],
    searchItems: [],
    search: undefined,
    expanded: [],
  });
  const nav = useNavigate();
  const errHandler = (e: any) => {
    console.error(e);
    nav("/500");
  };
  const fetchDataHandler = () => {
    getFrontendMethods()
      .then((methods) => {
        const methodTree = toMethodTree(methods);
        setData({
          ...data,
          searchItems: toMethodTreeSearchItems(methods),
          expanded: getAllNodeIds(methodTree),
          methodTree: filterMethodTree(methodTree, data.search),
        });
      })
      .catch(errHandler);
  }
  useEffect(()=>{
    fetchDataHandler();
    on({eventName:"windowInited",handler:fetchDataHandler});
    on({eventName:"componentInited",handler:fetchDataHandler});
    return ()=>{
      un({eventName:"windowInited",handler:fetchDataHandler});
      un({eventName:"componentInited",handler:fetchDataHandler});
    }
  }, [method, data.search, dispatch]);
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
            value={data.search}
            sx={{ width: "100%" }}
            options={data.searchItems}
            autoHighlight
            autoSelect
            onChange={(evt, search: any) => {
              setData({
                ...data,
                search,
              });
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
        <Card sx={{ flex: 1, overflow: "auto" }}>
          <CustomTreeView
            expanded={data.expanded}
            selected={method ? [toMethodTreeNodeId(method)] : []}
            defaultCollapseIcon={<MinusSquare />}
            defaultExpandIcon={<PlusSquare />}
            defaultEndIcon={<div style={{ width: 24 }} />}
            onNodeToggle={(evt, expanded) => {
              setData({
                ...data,
                expanded,
              });
            }}
            onNodeSelect={(evt: any, nodeId: any) => {
              if (nodeId && nodeId.indexOf("_@_methods_$_") != -1) {
                const list = nodeId.split("_$_");
                if (list.length == 3) {
                  dispatch(
                    setMethod({
                      componentCode: list[0],
                      methodCode: list[2],
                    })
                  );
                } else if (list.length == 5) {
                  dispatch(
                    setMethod({
                      componentCode: list[0],
                      windowCode: list[2],
                      methodCode: list[4],
                    })
                  );
                } else {
                  dispatch(setMethod(undefined));
                }
              } else {
                dispatch(setMethod(undefined));
              }
            }}
            tree={data.methodTree}
            labelTemplate={(props, node) => {
              const { nodeId } = props;
              const highlight = data.search
                ? toMethodTreeNodeId(data.search) == nodeId
                : false;
              let tooltipTitle: null | ReactNode = null;
              if (node.type == "component") {
                tooltipTitle = (
                  <Typography variant="body2">{`构件编号：${node.componentCode}`}</Typography>
                );
              } else if (node.type == "window") {
                tooltipTitle = (
                  <Fragment>
                    <Typography variant="body2">{`构件编号：${node.componentCode}`}</Typography>
                    <Typography variant="body2">{`窗体编号：${node.windowCode}`}</Typography>
                  </Fragment>
                );
              } else if (node.type == "method") {
                tooltipTitle = (
                  <Fragment>
                    <Typography variant="body2">{`构件编号：${node.componentCode}`}</Typography>
                    {node.windowCode ? (
                      <Typography variant="body2">{`窗体编号：${node.windowCode}`}</Typography>
                    ) : null}
                    <Typography variant="body2">{`方法编号：${node.methodCode}`}</Typography>
                  </Fragment>
                );
              }
              return (
                <Box
                  sx={{ display: "flex", alignItems: "center", p: 0.5, pr: 0 }}
                >
                  <Box
                    component={
                      node.type == "component"
                        ? CallToActionIcon
                        : node.type == "catalog"
                        ? FolderIcon
                        : node.type == "window"
                        ? ViewTimelineIcon
                        : SchemaIcon
                    }
                    color="inherit"
                    sx={{ mr: 1 }}
                  />
                  <Tooltip title={tooltipTitle} enterDelay={1000} enterNextDelay={1000} sx={{maxWidth:"auto"}}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "inherit",
                        flexGrow: 1,
                      }}
                    >
                      {highlight ? (
                        <Typography
                          component="span"
                          sx={{
                            backgroundColor: "#ff9632",
                            color: "black",
                            wordBreak: "break-all",
                          }}
                        >
                          {node.label}
                        </Typography>
                      ) : (
                        node.label
                      )}
                    </Typography>
                  </Tooltip>
                </Box>
              );
            }}
          ></CustomTreeView>
        </Card>
      </Box>
    </Fragment>
  );
}

export default FrontendMethodTree;
