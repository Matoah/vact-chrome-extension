import {
  useEffect,
  useState,
} from 'react';

import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';

import Navigator from '../components/Navigator';
import VjsSizeBubbleChart from '../components/VjsSizeBubbleChart';

//import { getScript } from '../script';

function VjsSizeAnalysis() {
  const [children, setChildren] = useState(function () {
    return (
      <CircularProgress size={80} sx={{ boxShadow: 0 }}></CircularProgress>
    );
  });
  const params = useParams();
  useEffect(() => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getVjsContent", {
        id: params.id,
      });
      promise.then((content: string) => {
        setChildren(
          <VjsSizeBubbleChart content={content}></VjsSizeBubbleChart>
        );
      });
      /*const content = getScript();
    setChildren(<VjsSizeBubbleChart content={content}></VjsSizeBubbleChart>);*/
    }
  }, [params.id]);
  return (
    <Container sx={{ width: "100%", height: "100%" }}>
      <Card
        sx={{
          p: 3,
          mb: 3,
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
      <Navigator />
    </Container>
  );
}

export default VjsSizeAnalysis;
