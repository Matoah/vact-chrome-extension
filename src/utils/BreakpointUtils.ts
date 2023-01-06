import { Breakpoint } from './Types';

export function isEqual(bp: Breakpoint, breakpoint: Breakpoint) {
  if (
    bp.location.componentCode == breakpoint.location.componentCode &&
    bp.location.methodCode == breakpoint.location.methodCode &&
    bp.location.ruleCode == breakpoint.location.ruleCode
  ) {
    if (
      typeof bp.location.windowCode == typeof breakpoint.location.windowCode
    ) {
      return true;
    }
  }
  return false;
}
