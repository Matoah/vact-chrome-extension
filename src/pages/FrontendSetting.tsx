import { Fragment } from 'react';

import Grid from '@mui/material/Grid';

import ConsoleSettingPaper from '../components/ConsoleSettingPaper';
import Navigator from '../components/Navigator';

interface FrontendSettingProps {}

function FrontendSetting(props: FrontendSettingProps) {
  return (
    <Fragment>
      <Grid
        container
        spacing={4}
        sx={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ConsoleSettingPaper></ConsoleSettingPaper>
      </Grid>
      <Navigator></Navigator>
    </Fragment>
  );
}

export default FrontendSetting;
