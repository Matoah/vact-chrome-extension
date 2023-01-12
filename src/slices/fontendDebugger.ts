import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { AppThunk } from '../store';
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
} from '../utils/RPCUtils';
import {
  Breakpoint,
  FrontendDebuggerState,
  Method,
  Operation,
  Rule,
} from '../utils/Types';

const initialState: FrontendDebuggerState = {
  breakpoints: [],
  operations: [
    {
      code: "play",
      title: "执行到下一个断点(F8)",
      icon: "FastForward",
      disabled: `play`,
      active: false,
    },
    {
      code: "next",
      title: "执行到下一个规则(F10)",
      icon: "SkipNext",
      disabled: `next`,
      active: false,
    },
    {
      code: "stepIn",
      title: "进入当前方法(F11)",
      icon: "Download",
      disabled: true,
      active: false,
    },
    {
      code: "stepOut",
      title: "跳出当前方法(Ctrl+F11)",
      icon: "Upload",
      disabled: true,
      active: false,
    },
    {
      code: "disableAll",
      title: "停用所有规则(Ctrl+F8)",
      icon: "LabelOff",
      disabled: false,
      active: false,
    },
    {
      code: "breakAll",
      title: "中断所有规则",
      icon: "DoneAll",
      disabled: `breakAll`,
      active: false,
    },
  ],
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
    updateOperation(
      state: FrontendDebuggerState,
      action: PayloadAction<{ operation: Operation | Operation[] }>
    ) {
      const { operation } = action.payload;
      const operations = state.operations.concat([]);
      let needUpdate = false;
      const list = Array.isArray(operation) ? operation : [operation];
      for (let j = 0; j < list.length; j++) {
        const op = list[j];
        for (let i = 0; i < operations.length; i++) {
          const element = operations[i];
          if (element.code == op.code) {
            operations[i] = op;
            needUpdate = true;
            break;
          }
        }
      }
      if (needUpdate) {
        state.operations = operations;
      }
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
      const operations: Operation[] = [];
      for (let i = 0; i < state.operations.length; i++) {
        const operation = state.operations[i];
        if (operation.code == "disableAll") {
          operations.push({
            ...operation,
            active: disableAll,
          });
        } else if (operation.code == "breakAll") {
          operations.push({
            ...operation,
            active: breakAll,
          });
        } else {
          operations.push({
            ...operation,
          });
        }
      }
      state.operations = operations;
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

export const updateOperation =
  (operation: Operation | Operation[]): AppThunk =>
  async (dispatch) => {
    const list = Array.isArray(operation) ? operation : [operation];
    for (let i = 0; i < list.length; i++) {
      const op = list[i];
      if (op.code == "disableAll") {
        const active = op.active;
        if (active) {
          await markIgnoreBreakpoints();
        } else {
          await unmarkIgnoreBreakpoints();
        }
      } else if (op.code == "breakAll") {
        const active = op.active;
        if (active) {
          await markBreakAllRule();
        } else {
          await unmarkBreakAllRule();
        }
      }
    }

    dispatch(slice.actions.updateOperation({ operation }));
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

export default slice;

export const reducer = slice.reducer;
