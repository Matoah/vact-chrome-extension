import {
  ChangeEvent,
  Fragment,
  useEffect,
  useState,
} from 'react';

import { Link as RouterLink } from 'react-router-dom';

import AnalyticsIcon from '@mui/icons-material/Analytics';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Navigator from '../components/Navigator';

interface VjsUrl {
  id: string;
  url: string;
}

function filter(
  urls: VjsUrl[],
  search: string
): Array<{ id: string; child: JSX.Element }> {
  const res: any[] = [];
  if (urls.length > 0) {
    urls.forEach((item: VjsUrl) => {
      const url = item.url;
      const index = url.indexOf(search);
      if (index != -1) {
        const children = [];
        if (index > 0) {
          children.push(
            <Typography variant="subtitle1">
              {url.substring(0, index)}
            </Typography>
          );
        }
        children.push(
          <Typography variant="subtitle1" sx={{ backgroundColor: "yellow" }}>
            {search}
          </Typography>
        );
        if (index + search.length < url.length) {
          children.push(
            <Typography variant="subtitle1">
              {url.substring(index + search.length)}
            </Typography>
          );
        }
        res.push({
          id: item.id,
          child: <Fragment key={item.id}>{children}</Fragment>,
        });
      }
    });
  }
  return res;
}

function VjsUrlList() {
  const [urls, setUrls] = useState<VjsUrl[]>(function () {
    return [
      {
        id: "1",
        url: "itop/vjs/combo/static/8a819b4e850e57d40185199867a646f5_b5e3df22d9698f0bfec7be73cf357835.js?vjsRequest=true&packageAliases=&vjsNames=%5B%7B%22vjs.framework.core%22%3Afalse%2C%22v_act_application%22%3Afalse%2C%22vact.vjs.framework.extension.platform.init.view.schema.window.vbase_prd_page_init.EmptyPageInit%22%3Afalse%7D%5D&condition=%7B%22clientType%22%3A%22pc%22%2C%22theme%22%3A%22default_theme%22%2C%22themeType%22%3A%22Default%22%2C%22isPure%22%3A%22false%22%2C%22domain%22%3Anull%7D",
      },
    ];
  });
  const [search, setSearch] = useState("");
  useEffect(() => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getVjsUrls", {});
      promise
        .then((vjsUrls: VjsUrl[]) => {
          setUrls(vjsUrls);
        })
        .catch();
    }
  }, []);
  let vjsUrls: Array<{ id: string; child: JSX.Element }> = [];
  if (search == "") {
    urls.forEach((url) => {
      vjsUrls.push({
        id: url.id,
        child: <Typography variant="subtitle1">{url.url}</Typography>,
      });
    });
  } else {
    vjsUrls = filter(urls, search);
  }
  return (
    <Fragment>
      <Card
        sx={{
          p: 2,
          mb: 3,
        }}
      >
        <Grid alignItems="center" container spacing={3}>
          <Grid item xs={12} lg={12} md={12}>
            <TextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                m: 0,
              }}
              onInput={(event: ChangeEvent<HTMLInputElement>) => {
                setSearch(event.target.value);
              }}
              placeholder="输入关键字过滤vjs链接 ..."
              value={search}
              fullWidth
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Card>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">{"vjs链接"}</TableCell>
                <TableCell align="center" sx={{ width: "100px" }}>
                  {"操作"}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vjsUrls.map((url) => {
                return (
                  <TableRow hover key={url.id}>
                    <TableCell sx={{ flex: "0 0 auto" }}>
                      <Box display="flex">
                        <Box pl={1} sx={{ flex: 0 }}>
                          {url.child}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ width: "100px" }}>
                      <Typography noWrap>
                        <Tooltip title={"大小分析"} arrow>
                          <IconButton
                            component={RouterLink}
                            to={`/vjsSizeAnalysis/${url.id}`}
                            color="primary"
                          >
                            <AnalyticsIcon />
                          </IconButton>
                        </Tooltip>
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <Navigator />
    </Fragment>
  );
}

export default VjsUrlList;
