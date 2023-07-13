const emitEvent = (isOpen, orientation) => {
  globalThis.dispatchEvent(
    new globalThis.CustomEvent("devtoolschange", {
      detail: {
        isOpen,
        orientation,
      },
    })
  );
};



export function  getLogicDefines (
  logics: any
): Array<{ methodCode: string; methodName: string }> {
  if (typeof logics != "string") {
    try {
      const defines: Array<{ methodCode: string; methodName: string }> = [];
      logics = Array.isArray(logics.logic) ? logics.logic : [logics.logic];
      logics.forEach((logic) => {
        const ruleSet = logic.ruleSets.ruleSet.$;
        defines.push({
          methodCode: ruleSet.code,
          methodName: ruleSet.name,
        });
      });
      return defines;
    } catch (e) {}
  }
  return [];
};
