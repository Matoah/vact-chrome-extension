/**
 *
 */
class FrontendJSON {
  json;
  //已检索过的值
  searched: Array<any> = [];

  keepDsContructor = false;

  constructor(json: any, keepDsContructor?: boolean) {
    this.json = json;
    this.keepDsContructor = !!keepDsContructor;
  }

  _toVal(val: any) {
    if (val) {
      if (typeof val._get == "function") {
        val = val._get();
      }
      if (typeof val.serialize == "function") {
        val = val.serialize();
        if (!this.keepDsContructor) {
          val = val.datas.values;
        }
      }
      const type = typeof val;
      const method = `_to${type.charAt(0).toUpperCase()}${type.substring(1)}`;
      const fn = this[method];
      if (fn) {
        return fn.call(this, val);
      } else {
        throw Error("未识别JSON值类型：" + type);
      }
    }
    return val;
  }

  _toString(val: any) {
    return val;
  }

  _toNumber(val: any) {
    return val;
  }

  _toBoolean(val: any) {
    return val;
  }

  _toUndefined(val: any) {
    return val;
  }

  _toFunction(val: any) {
    return {"function":val.toString()};
  }

  _toArray(val: any) {
    const result: Array<any> = [];
    const array = val as Array<any>;
    for (let i = 0, l = array.length; i < l; i++) {
      result.push(this._toVal(array[i]));
    }
    return result;
  }

  _toObject(val: any) {
    if (val == null) {
      return null;
    } else {
      if (this.searched.indexOf(val) != -1) {
        return "属性值存在循环使用，无法查看！";
      } else {
        this.searched.push(val);
        if (Array.isArray(val)) {
          return this._toArray(val);
        } else {
          const keys = Object.keys(val);
          const result = {};
          keys.forEach((key) => {
            result[key] = this._toVal(val[key]);
          });
          return result;
        }
      }
    }
  }

  _toSymbol(val:any){
    return val.toString()
  }

  /**
   * 处理json数据
   */
  parse() {
    return this._toVal(this.json);
  }
}

export default FrontendJSON;
