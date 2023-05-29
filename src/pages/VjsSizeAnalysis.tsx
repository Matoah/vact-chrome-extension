import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

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
import { getVjsContent } from '../utils/VjsUtils';

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
  const nav = useNavigate();
  const ondblclick = (vjsName:string)=>{
    nav(`/vjsDepAnalysis/${contentId}/${vjsName}`);
  }
  useEffect(() => {
    if (contentId) {
      getVjsContent(
        contentId,
        (content) => {
          setChildren(
            type == ChartType.Bubble ? (
              <VjsSizeBubbleChart content={content} onDblClick={ondblclick}/>
            ) : (
              <VjsSizeWallChart content={content} onDblClick={ondblclick}/>
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
