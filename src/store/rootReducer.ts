import { combineReducers } from '@reduxjs/toolkit';

import { reducer as fontendDebuggerReducer } from '../slices/fontendDebugger';

const rootReducer = combineReducers({
  frontendDebugger: fontendDebuggerReducer,
});

export default rootReducer;
