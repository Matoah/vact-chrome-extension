import {
  ChangeEvent,
  Fragment,
  useEffect,
  useState,
} from 'react';

import AnalyticsIcon from '@mui/icons-material/Analytics';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
import { getVjsUrls } from '../utils/RPCUtils';

interface VjsUrlListProps {
  tip: string;
  click: (id: string) => void;
}

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
            <Typography variant="subtitle1" component="span">
              {url.substring(0, index)}
            </Typography>
          );
        }
        children.push(
          <Typography
            variant="subtitle1"
            component="span"
            sx={{
              backgroundColor: "#ff9632",
              color: "black",
              wordBreak: "break-all",
            }}
          >
            {search}
          </Typography>
        );
        if (index + search.length < url.length) {
          children.push(
            <Typography
              variant="subtitle1"
              sx={{ wordBreak: "break-all" }}
              component="span"
            >
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

function VjsUrlList(pros: VjsUrlListProps) {
  const { click, tip } = pros;
  const [urls, setUrls] = useState<VjsUrl[]>(function () {
    return [];
  });
  const [search, setSearch] = useState("");
  useEffect(() => {
    getVjsUrls().then(setUrls);
  }, []);
  let vjsUrls: Array<{ id: string; child: JSX.Element }> = [];
  if (search == "") {
    urls.forEach((url) => {
      vjsUrls.push({
        id: url.id,
        child: (
          <Typography variant="subtitle1" sx={{ wordBreak: "break-all" }}>
            {url.url}
          </Typography>
        ),
      });
    });
  } else {
    vjsUrls = filter(urls, search);
  }
  return (
    <Fragment>
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

      <Card sx={{ mt: 1 }}>
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
                        <Box pl={1} sx={{ flex: 1 }}>
                          {url.child}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ width: "100px" }}>
                      <Typography>
                        <Tooltip title={tip} arrow>
                          <IconButton
                            onClick={() => {
                              click(url.id);
                            }}
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
