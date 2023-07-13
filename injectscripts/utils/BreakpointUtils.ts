import { Breakpoint } from '../types/Types';

export function indexOf(breakpoint: Breakpoint, breakpoints: Breakpoint[]) {
  for (let index = 0; index < breakpoints.length; index++) {
    const bp = breakpoints[index];
    if (
      bp.location.componentCode == breakpoint.location.componentCode &&
      bp.location.methodCode == breakpoint.location.methodCode &&
      bp.location.ruleCode == breakpoint.location.ruleCode
    ) {
      if (
        (!bp.location.windowCode && !breakpoint.location.windowCode) ||
        bp.location.windowCode == breakpoint.location.windowCode
      ) {
        return index;
      }
    }
  }
  return -1;
}
