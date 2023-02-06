export const isEmptyObject = function (obj: {}) {
  let res = true;
  for (let attr in obj) {
    res = false;
    break;
  }
  return res;
};

export const isObject = function (val: any) {
  return typeof val == "object" && val !== null;
};

export const isError = function (val: any) {
  return isObject(val) && val.__$vactType == "error";
};
