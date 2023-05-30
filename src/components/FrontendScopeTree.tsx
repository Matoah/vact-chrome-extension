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

import { setScopeTreeNode } from '../slices/fontendDataPortal';
import {
  useDispatch,
  useSelector,
} from '../store';
import {
  on,
  un,
} from '../utils/DevTools';
import { getFrontendScopes } from '../utils/RPCUtils';
import {
  filterScopeTree,
  getAllNodeIds,
  getScopeTreeNodeById,
  toScopeTree,
  toScopeTreeNodeId,
  toScopeTreeSearchItems,
} from '../utils/ScopeTreeUtils';
import {
  ScopeTreeNode,
  ScopeTreeSearchItem,
} from '../utils/Types';
import CustomTreeView from './CustomTreeView';
import MinusSquare from './MinusSquare';
import PlusSquare from './PlusSquare';

interface FrontendScopeTreeProps {}

function FrontendScopeTree(props: FrontendScopeTreeProps) {
  const dispatch = useDispatch();
  const { selectNode } = useSelector((state) => state.frontendDataPortal);
  const [data, setData] = useState<{
    scopeTree: ScopeTreeNode[];
    searchItems: ScopeTreeSearchItem[];
    expanded: string[];
    search?: ScopeTreeSearchItem;
  }>({
    scopeTree: [],
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
    getFrontendScopes()
      .then((scopes) => {
        const scopeTree = toScopeTree(scopes);
        setData({
          ...data,
          searchItems: toScopeTreeSearchItems(scopes),
          expanded: getAllNodeIds(scopeTree),
          scopeTree: filterScopeTree(scopeTree, data.search),
        });
      })
      .catch(errHandler);
  };
  useEffect(() => {
    fetchDataHandler();
    on({
      eventName: "windowInited",
      handler: fetchDataHandler,
    });
    on({
      eventName: "componentInited",
      handler: fetchDataHandler,
    });
    return () => {
      un({
        eventName: "windowInited",
        handler: fetchDataHandler,
      });
      un({
        eventName: "componentInited",
        handler: fetchDataHandler,
      });
    };
  }, [selectNode, data.search, dispatch]);
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
                label="搜索构件、窗体"
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
            selected={selectNode ? [toScopeTreeNodeId(selectNode)] : []}
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
              if (nodeId) {
                dispatch(
                  setScopeTreeNode(getScopeTreeNodeById(nodeId, data.scopeTree))
                );
              } else {
                dispatch(setScopeTreeNode(null));
              }
            }}
            tree={data.scopeTree}
            labelTemplate={(props, node) => {
              const { nodeId } = props;
              const highlight = data.search
                ? toScopeTreeNodeId(data.search) == nodeId
                : false;
              let tooltipTitle: null | ReactNode = null;
              if (node.type == "component") {
                tooltipTitle = (
                  <Fragment>
                    <Typography variant="body2">{`构件编号：${node.componentCode}`}</Typography>
                    <Typography variant="body2">{`实例Id：${node.id}`}</Typography>
                  </Fragment>
                );
              } else if (node.type == "window") {
                tooltipTitle = (
                  <Fragment>
                    <Typography variant="body2">{`构件编号：${node.componentCode}`}</Typography>
                    <Typography variant="body2">{`窗体编号：${node.windowCode}`}</Typography>
                    <Typography variant="body2">{`实例Id：${node.id}`}</Typography>
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
                  <Tooltip title={tooltipTitle} enterDelay={1000}>
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

export default FrontendScopeTree;
