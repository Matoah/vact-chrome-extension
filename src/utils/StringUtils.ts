export function uuid() {
  let S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
}

export function notEmpty(str: any) {
  return typeof str == "string" && str.trim() != "";
}
