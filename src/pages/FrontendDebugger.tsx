import { Fragment } from 'react';

import FrontendMethodTree from '../components/FrontendMethodTree';
import Navigator from '../components/Navigator';

function FrontendDebugger() {
  return (
    <Fragment>
      <FrontendMethodTree></FrontendMethodTree>
      <Navigator />
    </Fragment>
  );
}

export default FrontendDebugger;
