import {
  Fragment,
  useState,
} from 'react';

import DoneAllIcon from '@mui/icons-material/DoneAll';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import LabelOffIcon from '@mui/icons-material/LabelOff';
import PauseIcon from '@mui/icons-material/Pause';
import UploadIcon from '@mui/icons-material/Upload';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

interface FrontendDebugAttrPanelProps {}

const StyledBox = styled(Box)(({ theme }) => ({
  boxShadow: `0px 0px 2px #996a6a`,
  //borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.4)}`,
}));

function FrontendDebugAttrPanel(props: FrontendDebugAttrPanelProps) {
  const [data, setData] = useState({
    disabled: {
      pause: true,
      next: true,
      stepIn: true,
      stepOut: true,
      disableAll: false,
      breakAll: true,
    },
    expand: {
      monitor: true,
      breakpoint: true,
    },
  });
  return (
    <Fragment>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        <Card sx={{ flex: 1, ml: 1, display: "flex", flexDirection: "column" }}>
          <StyledBox sx={{ width: "100%" }}>
            <Tooltip title="暂停">
              <IconButton disabled={data.disabled.pause} aria-label="暂停">
                <PauseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="执行到下一个规则">
              <IconButton
                disabled={data.disabled.next}
                aria-label="下一个"
                color="primary"
              >
                <KeyboardTabIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="进入当前方法">
              <IconButton
                disabled={data.disabled.stepIn}
                color="secondary"
                aria-label="跳入"
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="跳出当前方法">
              <IconButton
                disabled={data.disabled.stepOut}
                color="secondary"
                aria-label="跳出"
              >
                <UploadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="停用所有规则">
              <IconButton
                disabled={data.disabled.disableAll}
                color="secondary"
                aria-label="停用"
              >
                <LabelOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="中断所有规则">
              <IconButton
                disabled={data.disabled.breakAll}
                color="secondary"
                aria-label="所有"
              >
                <DoneAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </StyledBox>
          <Box sx={{ flex: 1, mt: 1 }}>
            <Accordion
              expanded={data.expand["monitor"]}
              onChange={() => {
                const expand = { ...data.expand };
                expand["monitor"] = !expand.monitor;
                setData({
                  ...data,
                  expand,
                });
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography variant="body2">监视</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Nulla facilisi. Phasellus sollicitudin nulla et quam mattis
                  feugiat. Aliquam eget maximus est, id dignissim quam.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={data.expand["breakpoint"]}
              onChange={() => {
                const expand = { ...data.expand };
                expand["breakpoint"] = !expand.breakpoint;
                setData({
                  ...data,
                  expand,
                });
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2bh-content"
                id="panel2bh-header"
              >
                <Typography>断点</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Donec placerat, lectus sed mattis semper, neque lectus feugiat
                  lectus, varius pulvinar diam eros in elit. Pellentesque
                  convallis laoreet laoreet.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Card>
      </Box>
    </Fragment>
  );
}

export default FrontendDebugAttrPanel;
