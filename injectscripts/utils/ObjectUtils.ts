/**
 * 是否为空对象
 * @param obj
 * @returns
 */
export const isEmptyObject = function (obj: {}) {
  let res = true;
  for (let attr in obj) {
    res = false;
    break;
  }
  return res;
};
