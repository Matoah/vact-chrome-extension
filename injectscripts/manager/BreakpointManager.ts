import {
  Breakpoint,
  ExposeMethod,
} from '../types/Types';
import { indexOf } from '../utils/BreakpointUtils';
import LocalStorageManager from './private/LocalStorageManager';

class BreakpointManager implements ExposeMethod {

  private static INSTANCE = new BreakpointManager();

  static getInstance() {
    return BreakpointManager.INSTANCE;
  }

  localStorageManager = LocalStorageManager.getInstance();

  getExposeMethods(): string[] | undefined {
    return undefined;
  }

  getUnExposeMethods(): string[] | undefined {
    return ["getInstance"];
  }

  /**
   * 添加断点信息
   */
  addBreakpoint(breakpoint: Breakpoint) {
    const breakpointJson = this.localStorageManager.get(
      this.localStorageManager.KEYS.breakpoints
    );
    const breakpoints = breakpointJson ? JSON.parse(breakpointJson) : [];
    breakpoints.push(breakpoint);
    this.localStorageManager.set(
      this.localStorageManager.KEYS.breakpoints,
      JSON.stringify(breakpoints)
    );
  }
  /**
   * 更新断点信息
   * 开发者工具中可以启用/禁用断点
   */
  updateBreakpoint(breakpoint: Breakpoint) {
    const breakpointJson = this.localStorageManager.get(
      this.localStorageManager.KEYS.breakpoints
    );
    const breakpoints: Breakpoint[] = breakpointJson
      ? JSON.parse(breakpointJson)
      : [];
    for (let index = 0; index < breakpoints.length; index++) {
      const bp = breakpoints[index];
      if (
        bp.location.componentCode == breakpoint.location.componentCode &&
        bp.location.methodCode == breakpoint.location.methodCode &&
        bp.location.ruleCode == breakpoint.location.ruleCode
      ) {
        if (
          typeof bp.location.windowCode == typeof breakpoint.location.windowCode
        ) {
          breakpoints[index] = breakpoint;
        }
      }
    }
    this.localStorageManager.set(
      this.localStorageManager.KEYS.breakpoints,
      JSON.stringify(breakpoints)
    );
  }
  /**
   * 移除断点信息
   */
  removeBreakpoint(breakpoint: Breakpoint | Breakpoint[]) {
    const breakpointJson = this.localStorageManager.get(
      this.localStorageManager.KEYS.breakpoints
    );
    const breakpoints: Breakpoint[] = breakpointJson
      ? JSON.parse(breakpointJson)
      : [];
    const removed: Breakpoint[] = Array.isArray(breakpoint)
      ? breakpoint
      : [breakpoint];
    const storage: Breakpoint[] = [];
    breakpoints.forEach((bp) => {
      if (indexOf(bp, removed) == -1) {
        storage.push(bp);
      }
    });
    this.localStorageManager.set(
      this.localStorageManager.KEYS.breakpoints,
      JSON.stringify(storage)
    );
  }
  /**
   * 获取所有断点信息
   */
  getBreakpoints() {
    const breakpointJson = this.localStorageManager.get(
      this.localStorageManager.KEYS.breakpoints
    );
    return breakpointJson ? JSON.parse(breakpointJson) : [];
  }
  /**
   * 是否断点所有规则
   */
  isBreakAllRule() {
    return (
      this.localStorageManager.get(
        this.localStorageManager.KEYS.breakallrule
      ) == "true"
    );
  }
  /**
   * 标记断点所有规则
   */
  markBreakAllRule() {
    this.localStorageManager.set(
      this.localStorageManager.KEYS.breakallrule,
      "true"
    );
  }
  /**
   * 取消断点所有谷子额
   */
  unmarkBreakAllRule() {
    this.localStorageManager.set(
      this.localStorageManager.KEYS.breakallrule,
      "false"
    );
  }
  /**
   * 清除所有断点
   */
  clearBreakpoint() {
    this.unmarkBreakAllRule();
    this.localStorageManager.set(
      this.localStorageManager.KEYS.breakpoints,
      "[]"
    );
  }
  /**
   * 标记忽略所有断点
   */
  markIgnoreBreakpoints() {
    this.localStorageManager.set(
      this.localStorageManager.KEYS.ignorebreakpoints,
      "true"
    );
  }
  /**
   * 取消忽略所有断点
   */
  unmarkIgnoreBreakpoints() {
    this.localStorageManager.set(
      this.localStorageManager.KEYS.ignorebreakpoints,
      "false"
    );
  }
  /**
   * 是否忽略所有断点
   */
  isIgnoreBreakpoints() {
    return (
      this.localStorageManager.get(
        this.localStorageManager.KEYS.ignorebreakpoints
      ) == "true"
    );
  }
}

export default BreakpointManager;
