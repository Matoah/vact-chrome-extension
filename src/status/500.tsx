import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import pg from '../assets/500.svg';

const MainContent = styled(Box)(
  () => `
    height: 100%;
    display: flex;
    flex: 1;
    overflow: auto;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
);

function Status500() {
  return (
    <>
      <MainContent>
        <Grid
          container
          sx={{
            height: "100%",
          }}
          alignItems="stretch"
          spacing={0}
        >
          <Grid
            xs={12}
            md={12}
            alignItems="center"
            display="flex"
            justifyContent="center"
            item
          >
            <Container maxWidth="sm">
              <Box textAlign="center">
                <img alt="500" height={260} src={pg} />
                <Typography
                  variant="h2"
                  sx={{
                    my: 2,
                  }}
                >
                  出错了！
                </Typography>
                <Typography
                  variant="h4"
                  color="text.secondary"
                  fontWeight="normal"
                  sx={{
                    mb: 4,
                  }}
                >
                  系统内部出现未知异常，
                </Typography>
                <Button
                  href="/"
                  variant="contained"
                  sx={{
                    ml: 1,
                  }}
                >
                  返回主页
                </Button>
              </Box>
            </Container>
          </Grid>
        </Grid>
      </MainContent>
    </>
  );
}

export default Status500;
