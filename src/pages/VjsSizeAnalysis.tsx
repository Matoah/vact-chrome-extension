import {
  useEffect,
  useState,
} from 'react';

import { useParams } from 'react-router-dom';

import AnalyticsIcon from '@mui/icons-material/Analytics';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';

import Navigator from '../components/Navigator';
import VjsSizeBubbleChart from '../components/VjsSizeBubbleChart';
import VjsSizeWallChart from '../components/VjsSizeWallChart';
import { getVjsContent as getMockVjsContent } from '../utils/MockUtils';

//import { getScript } from '../script';
function getVjsContent(
  id: string,
  success: (content: string) => void,
  fail?: (e: any) => void
) {
  //@ts-ignore
  if (window.vact_devtools && window.vact_devtools.sendRequest) {
    //@ts-ignore
    const promise = window.vact_devtools.sendRequest("getVjsContent", {
      id: id,
    });
    promise
      .then((content: string) => {
        success(content);
      })
      .catch((e: any) => {
        if (fail) {
          fail(e);
        }
      });
  } else {
    success(getMockVjsContent());
  }
}

enum ChartType {
  Bubble,
  Wall,
}

function VjsSizeAnalysis() {
  const [type, setType] = useState(ChartType.Bubble);
  let [children, setChildren] = useState(function () {
    return (
      <CircularProgress size={80} sx={{ boxShadow: 0 }}></CircularProgress>
    );
  });
  const params = useParams();
  const contentId = params.id;
  if (!contentId) {
    children = (
      <Alert severity="error">
        <AlertTitle>分析Vjs大小失败</AlertTitle>
        无法获取Vjs内容，原因：未传递Vjs请求链接id
      </Alert>
    );
  }
  const menus =
    type == ChartType.Bubble
      ? [
          {
            title: "涂鸦墙",
            icon: <AnalyticsIcon fontSize="large" />,
            click: () => {
              setType(ChartType.Wall);
            },
          },
        ]
      : [
          {
            title: "泡泡图",
            icon: <BubbleChartIcon fontSize="large" />,
            click: () => {
              setType(ChartType.Bubble);
            },
          },
        ];
  useEffect(() => {
    if (contentId) {
      getVjsContent(
        contentId,
        (content) => {
          setChildren(
            type == ChartType.Bubble ? (
              <VjsSizeBubbleChart content={content} />
            ) : (
              <VjsSizeWallChart content={content} />
            )
          );
        },
        (e) => {
          setChildren(
            <Alert severity="error">
              <AlertTitle>分析Vjs大小失败</AlertTitle>
              失败原因：{e.message}
            </Alert>
          );
        }
      );
    }
  }, [params.id, type]);
  return (
    <Box sx={{ width: "100%", height: "100%", maxWidth: "100%" }}>
      <Card
        sx={{
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ width: "100%", height: "100%" }}
        >
          {children}
        </Box>
      </Card>
      <Navigator menus={menus} />
    </Box>
  );
}

export default VjsSizeAnalysis;
