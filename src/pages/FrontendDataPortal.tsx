import { Fragment } from 'react';

import Box from '@mui/material/Box';

import FrontendDataPanel from '../components/FrontendDataPanel';
import FrontendScopeTree from '../components/FrontendScopeTree';
import Navigator from '../components/Navigator';
import { SplitPane } from '../components/splitpanel';

function FrontendDataPortal() {
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
            <FrontendScopeTree></FrontendScopeTree>
          </Box>
          <Box sx={{ flexGrow: 1, height: "100%" }}>
            <FrontendDataPanel></FrontendDataPanel>
          </Box>
        </SplitPane>
      </Box>
      <Navigator/>
    </Fragment>
  );
}

export default FrontendDataPortal;
