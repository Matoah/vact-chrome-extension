import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { AppThunk } from '../store';
import { getBreakpoints as getRPCBreakpoints } from '../utils/RPCUtils';
import {
  Breakpoint,
  Method,
  Rule,
} from '../utils/Types';

interface FrontendDebuggerState {
  //断点集合
  breakpoints: Breakpoint[];
  //方法树
  //methodTree: MethodTreeNode[];
  //方法树展开节点
  //methodTreeExpand: string[];
  //方法规则配置树
  //ruleConfigTree: RuleConfigTreeNode[];
  //搜索候选项（过滤方法树）
  //searchItems: MethodTreeSearchItem[];
  //搜索值
  //search?: MethodTreeSearchItem;
  //当前方法
  method?: Method;
  //当前规则
  rule?: Rule;
  //当前调试规则
  debug?: Rule;
}

const initialState: FrontendDebuggerState = {
  breakpoints: [],
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

export default slice;

export const reducer = slice.reducer;
