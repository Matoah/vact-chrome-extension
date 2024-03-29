import {
  Fragment,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

import Navigator from '../components/Navigator';
import VjsDepNetworkChart from '../components/VjsDepNetworkChart';
import { getVjsUrl } from '../utils/RPCUtils';
import Vjs from '../utils/Vjs';
import VjsContentAnalysis from '../utils/VjsContentAnalysis';
import { getVjsContent } from '../utils/VjsUtils';

enum DepType {
  InverseDep,
  ForwardDep,
  CycleDep
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
  }
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
  key: null | string | undefined,
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
  if (key) {
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

function simplifyResult(vjsList: Vjs[], url: string, key: string | null | undefined) {
  if (!key) {
    return vjsList;
  }
  const tmp: Vjs[] = [];
  const params = new URLSearchParams(url);
  const vjsListStr = params.get("vjsNames");
  let requestVjsList: string[] = [];
  if (vjsListStr && vjsListStr.length > 0) {
    const json = JSON.parse(vjsListStr);
    json.forEach((item: { [vjsName: string]: boolean }) => {
      requestVjsList = requestVjsList.concat(Object.keys(item));
    });
  }
  const nameToDef: { [vjsName: string]: Vjs } = {};
  const interfaceNameToDef: { [vjsName: string]: Vjs } = {};
  vjsList.forEach((vjs) => {
    nameToDef[vjs.getName()] = vjs;
    const impls = vjs.getImpls();
    if (impls) {
      impls.forEach((impl) => {
        interfaceNameToDef[impl.name] = vjs;
      });
    }
  });
  const foundedVjsList: Vjs[] = [];
  const iterate = (vjs: Vjs) => {
    if (!exits(vjs.getName(), tmp) && !exits(vjs.getName(), foundedVjsList)) {
      const vjsIndex = tmp.length;
      tmp.push(vjs);
      foundedVjsList.push(vjs);
      const vjsName = vjs.getName();
      if (key == vjsName) {
        //移除其他多余依赖，精简视图
        const newVjs = vjs.clone();
        newVjs.setDeps([]);
        tmp[vjsIndex] = newVjs;
        return true;
      } else {
        const deps = vjs.getDeps();
        if (deps && deps.length > 0) {
          let hasFounded = false;
          for (let index = 0; index < deps.length; index++) {
            const dep = deps[index];
            const def = nameToDef[dep] || interfaceNameToDef[dep];
            if (def) {
              const res = iterate(def);
              if (res) {
                //移除其他多余依赖，精简视图
                const newVjs = vjs.clone();
                newVjs.setDeps([dep]);
                tmp[vjsIndex] = newVjs;
                hasFounded = true;
              }
            }
          }
          if (!hasFounded) {
            tmp.pop();
          }
          return hasFounded;
        } else {
          tmp.pop();
        }
      }
    }
    return false;
  };
  requestVjsList.forEach((vjsName) => {
    const vjs = nameToDef[vjsName] || interfaceNameToDef[vjsName];
    if (vjs) {
      iterate(vjs);
    }
  });
  return tmp;
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
  const ref = useRef(null);
  const params = useParams();
  const vjsId = params.id;
  const vjsName = params.vjsName;
  const [data, setData] = useState<{
    type: { code: DepType; label: string; desc: string };
    vjsList: string[];
    key: null | string | undefined;
    simplify: boolean;
    children: JSX.Element;
  }>({
    type: options[0],
    vjsList: [],
    key: vjsName,
    simplify: true,
    children: (
      <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ width: "100%", height: "100%" }}
        >
        <CircularProgress size={80} sx={{ boxShadow: 0 }}></CircularProgress>
      </Box>
    ),
  });
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
        //@ts-ignore
        getVjsUrl(vjsId)
          .then((url) => {
            const vjsSizeAnalyze = new VjsContentAnalysis(content);
            const vjsList = vjsSizeAnalyze.analyze();
            let result = filterVjsList(vjsList, data.type.code, data.key);
            if (data.simplify) {
              result = simplifyResult(result, url, data.key);
            }
            result = adjustResult(result);
            setData({
              ...data,
              vjsList: getVjsNames(vjsList),
              children: (
                <VjsDepNetworkChart vjsList={result} highlights={ data.key ? [data.key]:undefined}></VjsDepNetworkChart>
              ),
            });
          })
          .catch((e: any) => {
            setData({
              ...data,
              children: (
                <Alert severity="error">
                  <AlertTitle>分析Vjs依赖失败</AlertTitle>
                  遇到未知异常，原因：${e.message}
                </Alert>
              ),
            });
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
