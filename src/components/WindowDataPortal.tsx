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
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useSelector } from '../store';
import { getWindowDatas } from '../utils/RPCUtils';
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

function WindowWidgetPortal(props: { data: {} | null }) {
  const { data } = props;
  //@ts-ignore
  const widgets = data ? data["控件"] : null;
  if (widgets) {
    return <JsonDataTreeView json={widgets}></JsonDataTreeView>;
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
          <WindowWidgetPortal data={data}></WindowWidgetPortal>
        </AccordionDetails>
      </Accordion>
    </Fragment>
  );
}
