import { Fragment } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

import { useSelector } from '../store';
import ComponentDataPortal from './ComponentDataPortal';
import WindowDataPortal from './WindowDataPortal';

interface FrontendDataPanelProps{
}

export default function FrontendDataPanel(props:FrontendDataPanelProps) {
    const { selectNode } = useSelector((state) => state.frontendDataPortal);
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
        <Card sx={{ flex: 1, overflow: "auto" }}>
            {selectNode ? (selectNode.type=="window" ? <WindowDataPortal/>:<ComponentDataPortal/>):null}
        </Card>
      </Box>
    </Fragment>
  );
}
