import {
  Fragment,
  useState,
} from 'react';

import Box from '@mui/material/Box';

import FrontendMethodConfigTree from '../components/FrontendMethodConfigTree';
import FrontendMethodTree from '../components/FrontendMethodTree';
import Navigator from '../components/Navigator';

function FrontendDebugger() {
  const [data, setData] = useState<{
    currentMethod:
      | undefined
      | {
          componentCode: string;
          methodCode: string;
          windowCode?: string;
        };
    filter?: {
      code: string;
      componentCode: string;
      windowCode?: string;
      methodCode?: string;
      label: string;
    };
    breakpoints?: Array<{
      componentCode: string;
      methodCode: string;
      ruleCode: string;
      windowCode?: string;
    }>;
  }>(() => {
    return {
      currentMethod: undefined,
      filter: undefined,
      breakpoints: [],
    };
  });
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
            value={data.currentMethod}
          ></FrontendMethodConfigTree>
        </Box>
      </Box>
      <Navigator />
    </Fragment>
  );
}

export default FrontendDebugger;
