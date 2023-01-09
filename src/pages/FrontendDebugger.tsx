import {
  Fragment,
  useEffect,
  useState,
} from 'react';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import Box from '@mui/material/Box';

import FrontendDebugAttrPanel from '../components/FrontendDebugAttrPanel';
import FrontendMethodConfigTree from '../components/FrontendMethodConfigTree';
import FrontendMethodTree from '../components/FrontendMethodTree';
import Navigator from '../components/Navigator';
import {
  addBreakpoint,
  getBreakpoints,
  isBreakAllRule,
  isIgnoreBreakpoints,
  removeBreakpoint,
} from '../utils/RPCUtils';
import {
  Breakpoint,
  Operations,
} from '../utils/Types';

function FrontendDebugger() {
  const nav = useNavigate();
  const params = useLocation();
  //@ts-ignore
  let debugRule:
    | undefined
    | {
        componentCode: string;
        methodCode: string;
        ruleCode: string;
        windowCode?: string;
      } = undefined;
  let handleOperation = () => {};
  if (params && params.state) {
    debugRule = params.state.data;
    //@ts-ignore
    handleOperation = window[params.state.callbackId];
  }
  const errHandler = (e: any) => {
    console.error(e);
    nav("/500");
  };
  const [data, setData] = useState<{
    currentMethod:
      | undefined
      | {
          componentCode: string;
          methodCode: string;
          windowCode?: string;
        };
    currentRule?: {
      componentCode: string;
      methodCode: string;
      windowCode?: string;
      ruleCode: string;
    };
    filter?: {
      code: string;
      componentCode: string;
      windowCode?: string;
      methodCode?: string;
      label: string;
    };
    operations: Operations;
    breakpoints?: Breakpoint[];
  }>(() => {
    return {
      currentMethod: debugRule ? debugRule : undefined,
      currentRule: debugRule ? debugRule : undefined,
      filter: undefined,
      operations: {
        play: {
          disabled: debugRule ? false : true,
          active: debugRule ? true : false,
        },
        next: {
          disabled: debugRule ? false : true,
          active: debugRule ? true : false,
        },
        stepIn: { disabled: true, active: false },
        stepOut: { disabled: true, active: false },
        disableAll: { disabled: false, active: false },
        breakAll: { disabled: false, active: false },
      },
      breakpoints: [],
    };
  });
  const refresh = () => {
    getBreakpoints()
      .then((breakpoints) => {
        isIgnoreBreakpoints()
          .then((ignoreAll: boolean) => {
            isBreakAllRule()
              .then((breakAll: boolean) => {
                setData({
                  ...data,
                  breakpoints,
                  operations: {
                    ...data.operations,
                    disableAll: { disabled: false, active: ignoreAll },
                    breakAll: { disabled: false, active: breakAll },
                  },
                });
              })
              .catch(errHandler);
          })
          .catch(errHandler);
      })
      .catch(errHandler);
  };
  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => {
    setData({
      ...data,
      currentMethod: debugRule ? debugRule : undefined,
      currentRule: debugRule ? debugRule : undefined,
      filter: undefined,
      operations: {
        ...data.operations,
        play: {
          disabled: debugRule ? false : true,
          active: debugRule ? true : false,
        },
        next: {
          disabled: debugRule ? false : true,
          active: debugRule ? true : false,
        },
      },
    });
  }, [params && params.state ? params.state.callbackId : null]);
  return (
    <Fragment>
      <Box sx={{ display: "flex", height: "100%", width: "100%" }}>
        <Box sx={{ width: "300px", height: "100%" }}>
          <FrontendMethodTree
            value={data.currentMethod}
            filter={data.filter}
            onFilter={(filter) => setData({ ...data, filter })}
            onNodeSelect={(id) => {
              if (id && id.indexOf("_@_methods_$_") != -1) {
                const list = id.split("_$_");
                if (list.length == 3) {
                  setData({
                    ...data,
                    currentMethod: {
                      componentCode: list[0],
                      methodCode: list[2],
                    },
                  });
                } else if (list.length == 5) {
                  setData({
                    ...data,
                    currentMethod: {
                      componentCode: list[0],
                      windowCode: list[2],
                      methodCode: list[4],
                    },
                  });
                } else {
                  setData({ ...data, currentMethod: undefined });
                }
              } else {
                setData({ ...data, currentMethod: undefined });
              }
            }}
          ></FrontendMethodTree>
        </Box>
        <Box sx={{ flexGrow: 1, height: "100%" }}>
          <FrontendMethodConfigTree
            value={data.currentRule}
            currentMethod={data.currentMethod}
            breakpoints={data.breakpoints}
            operations={data.operations}
            onSelectRuleChanged={(rule) => {
              setData({
                ...data,
                currentRule: rule,
              });
            }}
            onBreakpointChanged={(debuged: boolean, breakpoint: Breakpoint) => {
              if (debuged) {
                addBreakpoint(breakpoint)
                  .then(() => {
                    getBreakpoints().then((breakpoints) => {
                      setData({
                        ...data,
                        breakpoints,
                      });
                    });
                  })
                  .catch();
              } else {
                removeBreakpoint(breakpoint)
                  .then(() => {
                    getBreakpoints().then((breakpoints) => {
                      setData({
                        ...data,
                        breakpoints,
                      });
                    });
                  })
                  .catch((e) => console.error(e));
              }
            }}
          ></FrontendMethodConfigTree>
        </Box>
        <Box sx={{ width: "300px", height: "100%" }}>
          <FrontendDebugAttrPanel
            value={debugRule}
            breakpoints={data.breakpoints}
            operations={data.operations}
            refresh={refresh}
            handleOperation={handleOperation}
            onBreakpointLocation={(breakpoint: Breakpoint) => {
              setData({
                ...data,
                currentRule: breakpoint.location,
                currentMethod: breakpoint.location,
              });
            }}
          />
        </Box>
      </Box>
      <Navigator />
    </Fragment>
  );
}

export default FrontendDebugger;
