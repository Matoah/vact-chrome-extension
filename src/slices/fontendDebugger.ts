import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { AppThunk } from "../store";
import {
  getBreakpoints as getRPCBreakpoints,
  addBreakpoint as addRPCBreakpoint,
  removeBreakpoint as removeRPCBreakpoint,
  updateBreakpoint as updateRPCBreakopoint,
} from "../utils/RPCUtils";
import {
  Breakpoint,
  Method,
  Operation,
  Rule,
  FrontendDebuggerState,
} from "../utils/Types";

const initialState: FrontendDebuggerState = {
  breakpoints: [],
  operations: [
    {
      code: "play",
      title: "执行到下一个断点(F8)",
      icon: "FastForward",
      status: {
        disabled: `return !state.debug || true;`,
        active: false,
      },
    },
    {
      code: "next",
      title: "执行到下一个规则(F10)",
      icon: "SkipNext",
      status: {
        disabled: `return !state.debug || true;`,
        active: false,
      },
    },
    {
      code: "stepIn",
      title: "进入当前方法(F11)",
      icon: "Download",
      status: {
        disabled: true,
        active: false,
      },
    },
    {
      code: "stepOut",
      title: "跳出当前方法(Ctrl+F11)",
      icon: "Upload",
      status: {
        disabled: true,
        active: false,
      },
    },
    {
      code: "disableAll",
      title: "停用所有规则(Ctrl+F8)",
      icon: "LabelOff",
      status: { disabled: false, active: false },
    },
    {
      code: "breakAll",
      title: "中断所有规则",
      icon: "DoneAll",
      status: {
        disabled: `const op = operations.find((p) => p.code == "disableAll");
          if (op) {
            return op.status.active;
          }
          return false;`,
        active: false,
      },
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
      action: PayloadAction<{ operation: Operation }>
    ) {
      const { operation } = action.payload;
      const operations = state.operations.concat([]);
      let needUpdate = false;
      for (let i = 0; i < operations.length; i++) {
        const element = operations[i];
        if (element.code == operation.code) {
          operations[i] = operation;
          needUpdate = true;
          break;
        }
      }
      if (needUpdate) {
        state.operations = operations;
      }
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
  (operation: Operation): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.updateOperation({ operation }));
  };

export default slice;

export const reducer = slice.reducer;
