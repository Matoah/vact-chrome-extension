import { combineReducers } from '@reduxjs/toolkit';

import {
  reducer as frontendDataPortalReducer,
} from '../slices/fontendDataPortal';
import { reducer as fontendDebuggerReducer } from '../slices/fontendDebugger';

const rootReducer = combineReducers({
  frontendDebugger: fontendDebuggerReducer,
  frontendDataPortal: frontendDataPortalReducer
});

export default rootReducer;
