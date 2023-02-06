import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { AppThunk } from "../store";
import {
  addBreakpoint as addRPCBreakpoint,
  getBreakpoints as getRPCBreakpoints,
  isBreakAllRule,
  isIgnoreBreakpoints,
  markBreakAllRule,
  markIgnoreBreakpoints,
  removeBreakpoint as removeRPCBreakpoint,
  unmarkBreakAllRule,
  unmarkIgnoreBreakpoints,
  updateBreakpoint as updateRPCBreakopoint,
} from "../utils/RPCUtils";
import {
  Breakpoint,
  FrontendDebuggerState,
  Method,
  Rule,
} from "../utils/Types";

const initialState: FrontendDebuggerState = {
  breakpoints: [],
  disableAll: false,
  breakAll: false,
  //methodTree: [],
  //methodTreeExpand: [],
  //ruleConfigTree: [],
  //searchItems: [],
};

const slice = createSlice({
  name: "frontendDebugger",
  initialState,
  reducers: {
    getBreakpoints(
      state: FrontendDebuggerState,
      action: PayloadAction<{ breakpoints: Breakpoint[] }>
    ) {
      const { breakpoints } = action.payload;
      state.breakpoints = breakpoints;
    },
    setMethod(
      state: FrontendDebuggerState,
      action: PayloadAction<{ method?: Method }>
    ) {
      const { method } = action.payload;
      state.method = method;
      state.rule = undefined;
    },
    setRule(
      state: FrontendDebuggerState,
      action: PayloadAction<{ rule?: Rule }>
    ) {
      const { rule } = action.payload;
      state.rule = rule;
    },
    setDebug(
      state: FrontendDebuggerState,
      action: PayloadAction<{ debug?: Rule }>
    ) {
      const { debug } = action.payload;
      state.debug = debug;
    },
    setDisableAll(
      state: FrontendDebuggerState,
      action: PayloadAction<{ disableAll: boolean }>
    ) {
      const { disableAll } = action.payload;
      state.disableAll = disableAll;
    },
    setBreakAll(
      state: FrontendDebuggerState,
      action: PayloadAction<{ breakAll: boolean }>
    ) {
      const { breakAll } = action.payload;
      state.breakAll = breakAll;
    },
    setDebugInfo(
      state: FrontendDebuggerState,
      action: PayloadAction<{
        method?: Method;
        rule?: Rule;
        debug?: Rule;
        debugCallbackId?: string;
      }>
    ) {
      const { method, rule, debug, debugCallbackId } = action.payload;
      state.method = method;
      state.rule = rule;
      state.debug = debug;
      state.debugCallbackId = debugCallbackId;
    },
    initState(
      state: FrontendDebuggerState,
      action: PayloadAction<{
        breakpoints: Breakpoint[];
        breakAll: boolean;
        disableAll: boolean;
      }>
    ) {
      const { breakpoints, breakAll, disableAll } = action.payload;
      state.breakpoints = breakpoints;
      state.breakAll = breakAll;
      state.disableAll = disableAll;
    },
  },
});

export const getBreakpoints = (): AppThunk => async (dispatch) => {
  const breakpoints = await getRPCBreakpoints();
  dispatch(slice.actions.getBreakpoints({ breakpoints }));
};

export const setMethod =
  (method?: Method): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.setMethod({ method }));
  };

export const setRule =
  (rule?: Rule): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.setRule({ rule }));
  };

export const setDebug =
  (debug?: Rule): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.setDebug({ debug }));
  };

export const addBreakpoint =
  (breakpoint: Breakpoint): AppThunk =>
  async (dispatch) => {
    await addRPCBreakpoint(breakpoint);
    const breakpoints = await getRPCBreakpoints();
    dispatch(slice.actions.getBreakpoints({ breakpoints }));
  };

export const removeBreakpoint =
  (breakpoint: Breakpoint | Breakpoint[]): AppThunk =>
  async (dispatch) => {
    await removeRPCBreakpoint(breakpoint);
    const breakpoints = await getRPCBreakpoints();
    dispatch(slice.actions.getBreakpoints({ breakpoints }));
  };

export const updateBreakpoint =
  (breakpoint: Breakpoint): AppThunk =>
  async (dispatch) => {
    await updateRPCBreakopoint(breakpoint);
    const breakpoints = await getRPCBreakpoints();
    dispatch(slice.actions.getBreakpoints({ breakpoints }));
  };

export const initState = (): AppThunk => async (dispatch) => {
  const breakpoints = await getRPCBreakpoints();
  const breakAll = await isBreakAllRule();
  const disableAll = await isIgnoreBreakpoints();
  dispatch(slice.actions.initState({ breakpoints, breakAll, disableAll }));
};

export const setDebugInfo =
  (
    method?: Method,
    rule?: Rule,
    debug?: Rule,
    debugCallbackId?: string
  ): AppThunk =>
  async (dispatch) => {
    dispatch(
      slice.actions.setDebugInfo({ method, rule, debug, debugCallbackId })
    );
  };

export const setDisableAll =
  (disableAll: boolean): AppThunk =>
  async (dispatch) => {
    if (disableAll) {
      await markIgnoreBreakpoints();
    } else {
      await unmarkIgnoreBreakpoints();
    }
    dispatch(slice.actions.setDisableAll({ disableAll }));
  };

export const setBreakAll =
  (breakAll: boolean): AppThunk =>
  async (dispatch) => {
    if (breakAll) {
      await markBreakAllRule();
    } else {
      await unmarkBreakAllRule();
    }
    dispatch(slice.actions.setBreakAll({ breakAll }));
  };

export default slice;

export const reducer = slice.reducer;
