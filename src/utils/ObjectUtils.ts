export const isEmptyObject = function (obj: {}) {
  let res = true;
  for (let attr in obj) {
    res = false;
    break;
  }
  return res;
};

export const isDatasourceData = function (data: any) {
  if (isObject(data)) {
    const determineType = (data: any) =>
      Object.prototype.toString.call(data).slice(8, -1).toLowerCase();

    const normalizeObject = {
      datas: {
        recordCount: 0,
        values: [],
      },
      metadata: {
        model: [],
      },
    };

    if (determineType(normalizeObject) !== determineType(data)) {
      return false;
    }

    function check(temp: any, data: any): boolean {
      const keys = Object.keys(temp);
      const result = keys.every((key: any) => {
        if (determineType(temp[key]) === "object") {
          return check(temp[key], data[key]);
        }
        return data && determineType(temp[key]) === determineType(data[key]);
      });
      return result;
    }
    return check(normalizeObject, data);
  }
  return false;
};

export const isObject = function (val: any) {
  return typeof val == "object" && val !== null;
};

export const isError = function (val: any) {
  return isObject(val) && val.__$vactType == "error";
};
