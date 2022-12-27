import { Fragment, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import TextField from "@mui/material/TextField";

import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import Card from "@mui/material/Card";
import Autocomplete from "@mui/material/Autocomplete";
import Navigator from "../components/Navigator";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import CircularProgress from "@mui/material/CircularProgress";
import { getVjsContent } from "../utils/VjsUtils";
import Vjs from "../utils/Vjs";
import VjsContentAnalysis from "../utils/VjsContentAnalysis";
import VjsDepNetworkChart from "../components/VjsDepNetworkChart";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";

enum DepType {
  InverseDep,
  ForwardDep,
}

const options = [
  {
    code: DepType.InverseDep,
    label: "反向查找",
    desc: "根据指定的vjs名称，查找其被依赖的路径，例：A依赖B，B依赖C，查找C，得到结果：C<-B<-A",
  },
  {
    code: DepType.ForwardDep,
    label: "正向查找",
    desc: "根据指定的vjs名称，查找其依赖路径，例：A依赖B，B依赖C，查找A，得到结果：A->B->C",
  },
];

function getVjsNames(vjsList: Vjs[]) {
  const vjsNames: string[] = [];
  vjsList.forEach((vjs) => {
    vjsNames.push(vjs.getName());
  });
  return vjsNames;
}

function name2VjsMap(vjsList: Vjs[]) {
  const map: { [vjsName: string]: Vjs } = {};
  vjsList.forEach((vjs) => {
    const vjsName = vjs.getName();
    map[vjsName] = vjs;
  });
  return map;
}

function dep2VjsMap(vjsList: Vjs[]) {
  const map: { [vjsName: string]: string[] } = {};
  vjsList.forEach((vjs) => {
    const vjsName = vjs.getName();
    const deps = vjs.getDeps();
    deps.forEach((dep) => {
      const list = map[dep] || [];
      list.push(vjsName);
      map[dep] = list;
    });
  });
  return map;
}

function exits(vjsName: string, vjsList: Vjs[]) {
  let result = false;
  for (let index = 0; index < vjsList.length; index++) {
    const vjs = vjsList[index];
    if (vjsName == vjs.getName()) {
      result = true;
      break;
    }
  }
  return result;
}

function filterVjsList(
  vjsList: Vjs[],
  type: DepType,
  key: null | string,
  result?: Vjs[],
  nameToVjsmap?: { [vjsName: string]: Vjs },
  depToVjsMap?: { [vjsName: string]: string[] }
) {
  result = result || [];
  if (!nameToVjsmap) {
    nameToVjsmap = name2VjsMap(vjsList);
  }
  if (!depToVjsMap) {
    depToVjsMap = dep2VjsMap(vjsList);
  }
  if (key != null) {
    const vjs = nameToVjsmap[key];
    if (vjs && result.indexOf(vjs) == -1) {
      result.push(vjs);
      const deps =
        //@ts-ignore
        type == DepType.InverseDep ? depToVjsMap[key] : vjs.getDeps();
      if (deps && deps.length > 0) {
        deps.forEach((dep) => {
          if (!exits(dep, result || [])) {
            filterVjsList(
              vjsList,
              type,
              dep,
              result,
              nameToVjsmap,
              depToVjsMap
            );
          }
        });
      }
    }
  } else {
    result = vjsList;
  }
  return result;
}

/**
 * 调整结果
 * 1、剔除在本次结果中不存定义的vjs依赖
 * 2、调整依赖关系，解决依赖图复杂问题
 * @param vjsList
 * @returns
 */
function adjustResult(vjsList: Vjs[]) {
  const temp: Vjs[] = [];
  const nameMap = name2VjsMap(vjsList);
  vjsList.forEach((vjs) => {
    const deps = vjs.getDeps();
    const newDeps: string[] = [];
    deps.forEach((dep) => {
      //@ts-ignore
      if (nameMap[dep]) {
        newDeps.push(dep);
      }
    });
    temp.push(new Vjs(vjs.getName(), vjs.getSize(), newDeps));
  });
  return temp;
}

function VjsDepAnalysis() {
  const [data, setData] = useState<{
    type: { code: DepType; label: string; desc: string };
    vjsList: string[];
    key: null | string;
    simplify: boolean;
    children: JSX.Element;
  }>({
    type: options[0],
    vjsList: [],
    key: null,
    simplify: false,
    children: (
      <CircularProgress size={80} sx={{ boxShadow: 0 }}></CircularProgress>
    ),
  });
  const ref = useRef(null);
  const params = useParams();
  const vjsId = params.id;
  if (!vjsId) {
    data.children = (
      <Alert severity="error">
        <AlertTitle>分析Vjs依赖失败</AlertTitle>
        无法获取Vjs内容，原因：未传递Vjs请求链接id
      </Alert>
    );
  }
  useEffect(() => {
    getVjsContent(
      //@ts-ignore
      vjsId,
      (content: string) => {
        const vjsSizeAnalyze = new VjsContentAnalysis(content);
        const vjsList = vjsSizeAnalyze.analyze();
        setData({
          ...data,
          vjsList: getVjsNames(vjsList),
          children: (
            <VjsDepNetworkChart
              vjsList={adjustResult(
                filterVjsList(vjsList, data.type.code, data.key)
              )}
            ></VjsDepNetworkChart>
          ),
        });
      },
      (e: any) => {
        setData({
          ...data,
          children: (
            <Alert severity="error">
              <AlertTitle>分析Vjs依赖失败</AlertTitle>
              遇到未知异常，原因：${e.message}
            </Alert>
          ),
        });
      }
    );
  }, [data.key, data.type.code, data.simplify]);

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
        <Card
          sx={{
            p: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex" }}>
            <Autocomplete
              disableClearable
              sx={{ width: 300 }}
              value={data.type}
              options={options}
              autoHighlight
              autoSelect
              onChange={(evt, option) => {
                setData({ ...data, type: option });
              }}
              getOptionLabel={(option) => option.label}
              renderOption={(props, option) => {
                return (
                  <ListItem disablePadding {...props} key={option.code}>
                    <ListItemButton>
                      <ListItemText
                        primary={option.label}
                        secondary={option.desc}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="请选择依赖类型"
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: "new-password", // disable autocomplete and autofill
                  }}
                />
              )}
            />
            <Autocomplete
              sx={{ width: "100%", ml: 1 }}
              value={data.key}
              options={data.vjsList}
              onChange={(evt, vjsName) => {
                setData({ ...data, key: vjsName });
              }}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => {
                return (
                  <ListItem disablePadding {...props} key={option}>
                    <ListItemButton>
                      <ListItemText primary={option} />
                    </ListItemButton>
                  </ListItem>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="请选择vjs名称"
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: "new-password", // disable autocomplete and autofill
                  }}
                />
              )}
            ></Autocomplete>
            <FormGroup sx={{ ml: 1 }}>
              <Tooltip title="去除一些vjs依赖，简化依赖图形，方便查找问题">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={data.simplify}
                      onChange={(evt, value) => {
                        setData({
                          ...data,
                          simplify: value,
                        });
                      }}
                    />
                  }
                  label="精简依赖"
                />
              </Tooltip>
            </FormGroup>
          </Box>
        </Card>
        <Card ref={ref} sx={{ flex: 1, width: "100%", height: "100%" }}>
          {data.children}
        </Card>
        <Navigator />
      </Box>
    </Fragment>
  );
}

export default VjsDepAnalysis;
