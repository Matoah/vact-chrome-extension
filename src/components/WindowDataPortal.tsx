import {
  Fragment,
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  alpha,
  useTheme,
} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useSelector } from '../store';
import {
  getWindowDatas,
  highlightWidget,
  unHighlightWidget,
} from '../utils/RPCUtils';
import { TreeNode } from '../utils/Types';
import DatasourceTable from './DatasourceTable';
import JsonDataTreeView from './JsonDataTreeView';
import VariableDisplayTable from './VariableDisplayTable';

interface WindowDataPortalProps {}

function WindowInputPortal(props: { data: {} | null }) {
  const { data } = props;
  //@ts-ignore
  const inputs = data ? data["输入"] : null;
  return (
    <VariableDisplayTable
      variables={inputs}
      prefix="窗体输入"
    ></VariableDisplayTable>
  );
}

function WindowOutputPortal(props: { data: {} | null }) {
  const { data } = props;
  //@ts-ignore
  const outputs = data ? data["输出"] : null;
  return (
    <VariableDisplayTable
      variables={outputs}
      prefix="窗体输出"
    ></VariableDisplayTable>
  );
}

function WindowEntityPortal(props: { data: {} | null }) {
  const { data } = props;
  const theme = useTheme();
  //@ts-ignore
  const entities = data ? data["实体"] : null;
  const [expanded, setExpanded] = useState<{ [entityCode: string]: boolean }>(
    {}
  );
  if (entities) {
    const children = Object.keys(entities).map((name, index) => {
      const entityJson = entities[name];
      return (
        <Card
          key={name}
          sx={{
            marginTop: index > 0 ? "16px" : "0px",
            "&:hover": {
              transform: "translateY(-5px) !important",
              boxShadow: `0 2rem 8rem 0 ${alpha(
                //@ts-ignore
                theme.colors.alpha.black[100],
                0.05
              )}, 
            0 0.6rem 1.6rem ${alpha(
              //@ts-ignore
              theme.colors.alpha.black[100],
              0.15
            )}, 
            0 0.2rem 0.2rem ${alpha(
              //@ts-ignore
              theme.colors.alpha.black[100],
              0.1
            )}`,
            },
          }}
        >
          <Box
            sx={{ display: "flex" }}
            onClick={() => {
              setExpanded({
                ...expanded,
                [name]: !expanded[name],
              });
            }}
          >
            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                padding: "16px 0px",
              }}
            >
              <Typography variant="button" sx={{ textTransform: "none" }}>
                {name}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {expanded[name] ? (
                <IconButton
                  sx={{ border: "none", outline: "none !important" }}
                  onClick={() => {
                    setExpanded({
                      ...expanded,
                      [name]: false,
                    });
                  }}
                >
                  <ExpandLessIcon></ExpandLessIcon>
                </IconButton>
              ) : (
                <IconButton
                  sx={{ border: "none", outline: "none !important" }}
                  onClick={() => {
                    setExpanded({
                      ...expanded,
                      [name]: true,
                    });
                  }}
                >
                  <ExpandMoreIcon></ExpandMoreIcon>
                </IconButton>
              )}
            </Box>
          </Box>
          {expanded[name] ? (
            <DatasourceTable data={entityJson}></DatasourceTable>
          ) : null}
        </Card>
      );
    });
    return <Fragment>{children}</Fragment>;
  } else {
    return <Typography>没有窗体实体信息！</Typography>;
  }
}

function getAllWidgetCodes(widgets: any) {
  let widgetCodes: string[] = [];
  if (widgets) {
    widgets = Array.isArray(widgets) ? widgets : [widgets];
    widgets.forEach((widget: any) => {
      const code = widget.properties?.code;
      if (code) {
        widgetCodes.push(code);
      }
      const controls = widget.controls;
      if (controls && controls.length > 0) {
        widgetCodes = widgetCodes.concat(getAllWidgetCodes(controls));
      }
    });
  }
  return widgetCodes;
}

function toOptions(widgetCodes: string[]) {
  const options: Array<{ label: string }> = [];
  widgetCodes.forEach((widgetCode) => options.push({ label: widgetCode }));
  return options;
}

function toJsonPath(widgetCode: string, widget: any, paths?: string[]) {
  paths = paths ? paths : [];
  if (widgetCode && widget) {
    const code = widget.properties?.code;
    if (code == widgetCode) {
      paths.push("properties");
      paths.push("code");
      return true;
    } else {
      const controls = widget.controls;
      if (controls && controls.length > 0) {
        paths.push("controls");
        for (let index = 0; index < controls.length; index++) {
          const control = controls[index];
          paths.push("" + index);
          const rs = toJsonPath(widgetCode, control, paths);
          if (rs) {
            return true;
          } else {
            paths.pop();
          }
        }
        paths.pop();
      }
    }
  }
  return false;
}

function getJsonPath(widgetCode: string, widget: any) {
  const paths: string[] = [];
  toJsonPath(widgetCode, widget, paths);
  return paths;
}

function WindowWidgetPortal(props: { instanceId: string; data: {} | null }) {
  const { instanceId, data } = props;
  //@ts-ignore
  const widgets = data ? data["控件"] : null;
  if (widgets) {
    const [data, setData] = useState<{
      search?: { label: string };
      searchItems: Array<{ label: string }>;
    }>(() => {
      return {
        search: undefined,
        searchItems: toOptions(getAllWidgetCodes(widgets)),
      };
    });
    const expanded = getJsonPath(data.search ? data.search.label : "", widgets);
    return (
      <List>
        <ListItem disablePadding>
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
                <ListItem disablePadding {...props} key={option.label}>
                  <ListItemButton>
                    <ListItemText primary={option.label} />
                  </ListItemButton>
                </ListItem>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="请输入控件编号"
                inputProps={{
                  ...params.inputProps,
                  autoComplete: "new-password", // disable autocomplete and autofill
                }}
              />
            )}
          />
        </ListItem>
        <ListItem disablePadding>
          <JsonDataTreeView
            sx={{ width: "100%" }}
            json={widgets}
            expanded={expanded}
            selected={expanded}
            onMouseLeave={()=>{
              unHighlightWidget();
            }}
            onMouseOver={(treeNode:TreeNode) => {
              try {
                const nodeId = treeNode.id;
                const paths = nodeId.split("_$_");
                //删除root
                paths.splice(0, 1);
                let widget = widgets;
                const pathLen = paths.length;
                let index = 0,
                  node = widgets;
                while (index < pathLen) {
                  const p = paths[index];
                  node = node[p];
                  if (paths[index - 1] == "controls") {
                    widget = node;
                  }
                  index++;
                }
                if (widget) {
                  const widgetCode = widget.properties.code;
                  highlightWidget({
                    instanceId,
                    widgetCode,
                  });
                }
              } catch (e) {
                console.log("高亮控件时出现异常！");
                console.log(e);
              }
            }}
          ></JsonDataTreeView>
        </ListItem>
      </List>
    );
  } else {
    return <Typography>没有窗体控件信息！</Typography>;
  }
}

export default function WindowDataPortal(props: WindowDataPortalProps) {
  const { selectNode } = useSelector((state) => state.frontendDataPortal);
  const nav = useNavigate();
  const errHandler = (e: any) => {
    console.error(e);
    nav("/500");
  };
  const [data, setData] = useState<{} | null>(null);
  useEffect(() => {
    if (selectNode) {
      getWindowDatas(selectNode.id)
        .then((data) => {
          setData(data);
        })
        .catch(errHandler);
    } else {
      setData(null);
    }
  }, [selectNode]);
  return (
    <Fragment>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>窗体输入</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <WindowInputPortal data={data}></WindowInputPortal>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>窗体输出</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <WindowOutputPortal data={data}></WindowOutputPortal>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>窗体实体</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <WindowEntityPortal data={data}></WindowEntityPortal>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>窗体控件</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <WindowWidgetPortal
            data={data}
            instanceId={selectNode ? selectNode.id:""}
          ></WindowWidgetPortal>
        </AccordionDetails>
      </Accordion>
    </Fragment>
  );
}
