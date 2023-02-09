import {
  Fragment,
  useEffect,
} from 'react';

import { useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';

import FrontendDebugAttrPanel from '../components/FrontendDebugAttrPanel';
import FrontendMethodConfigTree from '../components/FrontendMethodConfigTree';
import FrontendMethodTree from '../components/FrontendMethodTree';
import Navigator from '../components/Navigator';
import { SplitPane } from '../components/splitpanel';
import {
  initState,
  setDebugInfo,
} from '../slices/fontendDebugger';
import { useDispatch } from '../store';

function FrontendDebugger() {
  const params = useLocation();
  const dispatch = useDispatch();
  useEffect(() => {
    if (params && params.state && params.state.callbackId) {
      const data = params.state.data;
      const method = {
        componentCode: data.rule.componentCode,
        windowCode: data.rule.windowCode,
        methodCode: data.rule.methodCode,
      };
      const rule = {
        method,
        code: data.rule.ruleCode,
      };
      dispatch(
        setDebugInfo(
          method,
          rule,
          { type: data.type, rule },
          params.state.callbackId
        )
      );
    }
  }, [
    params && params.state && params.state.callbackId
      ? params.state.callbackId
      : null,
  ]);
  useEffect(() => {
    dispatch(initState());
  }, [dispatch]);
  return (
    <Fragment>
      <Box
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
        }}
      >
        <SplitPane
          split="vertical"
          initialSizes={[1, 3, 1]}
          resizerOptions={{
            css: {
              width: "1px",
              background: "rgba(0, 0, 0, 0.1)",
            },
            hoverCss: {
              width: "3px",
              background: "1px solid rgba(102, 194, 255, 0.5)",
            },
            grabberSize: "10px",
          }}
          collapse={true}
        >
          <Box
            sx={{
              height: "100%",
            }}
          >
            <FrontendMethodTree></FrontendMethodTree>
          </Box>
          <Box sx={{ flexGrow: 1, height: "100%" }}>
            <FrontendMethodConfigTree></FrontendMethodConfigTree>
          </Box>
          <Box sx={{ height: "100%" }}>
            <FrontendDebugAttrPanel />
          </Box>
        </SplitPane>
      </Box>
      <Navigator />
    </Fragment>
  );
}

export default FrontendDebugger;
