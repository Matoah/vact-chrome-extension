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
import {
  initState,
  setDebugInfo,
} from '../slices/fontendDebugger';
import { useDispatch } from '../store';
import { printToWebPageConsole } from '../utils/RPCUtils';

function FrontendDebugger() {
  const params = useLocation();
  const dispatch = useDispatch();
  useEffect(() => {
    if (params && params.state && params.state.callbackId) {
      printToWebPageConsole(`FrontendDebugger:` + JSON.stringify(params.state));
      const data = params.state.data;
      const method = {
        componentCode: data.componentCode,
        windowCode: data.windowCode,
        methodCode: data.methodCode,
      };
      const rule = {
        method,
        code: data.ruleCode,
      };
      dispatch(setDebugInfo(method, rule, rule, params.state.callbackId));
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
      <Box sx={{ display: "flex", height: "100%", width: "100%" }}>
        <Box sx={{ width: "300px", height: "100%" }}>
          <FrontendMethodTree></FrontendMethodTree>
        </Box>
        <Box sx={{ flexGrow: 1, height: "100%" }}>
          <FrontendMethodConfigTree></FrontendMethodConfigTree>
        </Box>
        <Box sx={{ width: "300px", height: "100%" }}>
          <FrontendDebugAttrPanel />
        </Box>
      </Box>
      <Navigator />
    </Fragment>
  );
}

export default FrontendDebugger;
