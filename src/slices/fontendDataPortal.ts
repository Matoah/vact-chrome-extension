import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { AppThunk } from '../store';
import {
  FrontendDataPortalState,
  ScopeTreeNode,
} from '../utils/Types';

const initialState: FrontendDataPortalState = {
  selectNode: null,
};

const slice = createSlice({
  name: "frontendDebugger",
  initialState,
  reducers: {
    setScopeTreeNode(
      state: FrontendDataPortalState,
      action: PayloadAction<{ node: ScopeTreeNode | null }>
    ) {
      const { node } = action.payload;
      state.selectNode = node;
    }
  },
});

export const setScopeTreeNode =
  (node: ScopeTreeNode | null): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.setScopeTreeNode({ node }));
  };

export default slice;

export const reducer = slice.reducer;