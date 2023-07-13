enum KEYS {
  /**
   * 忽略所有规则断点
   */
  ignorebreakpoints,
  /**
   * 中断所有规则
   */
  breakallrule,
  /**
   * chrome插件id
   */
  extensionId,
  /**
   * 规则断点
   */
  breakpoints,
  /**
   * 是否记录前端耗时
   */
  isMonitored,
  //日志设置
  consoleSetting,
}

/**
 * 本地缓存管理器
 */
class LocalStorageManager {
  private static INSTANCE = new LocalStorageManager();
  /**
   * 获取实例
   * @returns
   */
  static getInstance() {
    return LocalStorageManager.INSTANCE;
  }
  /**
   * 本地缓存Key值
   */
  KEYS = KEYS;

  /**
   * 生成vact开发者工具key
   * @param key
   * @returns
   */
  private _toLocalStorageKey(key: KEYS) {
    return `vact_devtools_${key.toString()}`;
  }

  set(key: KEYS, value: string) {
    window.localStorage.setItem(this._toLocalStorageKey(key), value);
  }

  get(key: KEYS) {
    return window.localStorage.getItem(this._toLocalStorageKey(key));
  }
}

export default LocalStorageManager;
export { KEYS, LocalStorageManager };
