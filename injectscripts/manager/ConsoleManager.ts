import {
  ConsoleSetting,
  ExposeMethod,
} from '../types/Types';
import LocalStorageManager from './private/LocalStorageManager';

class ConsoleManager implements ExposeMethod {
  private static INSTANCE = new ConsoleManager();

  static getInstsance() {
    return ConsoleManager.INSTANCE;
  }

  localstorageManager = LocalStorageManager.getInstance();

  consoleSetting: null | ConsoleSetting;

  getExposeMethods(): string[] | undefined {
    return undefined;
  }

  getUnExposeMethods(): string[] | undefined {
    return ["getInstsance"];
  }

  /**
   * 设置日志打印信息
   * @param logSetting
   */
  setConsoleSetting(consoleSetting: ConsoleSetting) {
    this.consoleSetting = consoleSetting;
    this.localstorageManager.set(
      this.localstorageManager.KEYS.consoleSetting,
      JSON.stringify(consoleSetting)
    );
  }

  /**
   * 获取日志打印信息
   */
  getConsoleSetting() {
    const consoleSetting = this.localstorageManager.get(
      this.localstorageManager.KEYS.consoleSetting
    );
    return consoleSetting ? JSON.parse(consoleSetting) : {};
  }

  private _getConsoleSettingFromCache() {
    if (!this.consoleSetting) {
      this.consoleSetting = this.getConsoleSetting();
    }
  }

  /**
   * 是否打印调试日志
   */
  isEnableDebugLog() {
    this._getConsoleSettingFromCache();
    return !!this.consoleSetting?.enable && !!this.consoleSetting?.enableDebug;
  }

  /**
   * 是否打印消息日志
   */
  isEnableInfoLog() {
    this._getConsoleSettingFromCache();
    return !!this.consoleSetting?.enable && !!this.consoleSetting?.enableInfo;
  }

  /**
   * 是否打印警告日志
   */
  isEnableWarnLog() {
    this._getConsoleSettingFromCache();
    return !!this.consoleSetting?.enable && !!this.consoleSetting?.enableWarn;
  }

  /**
   * 是否打印错误日志
   */
  isEnableErrorLog() {
    this._getConsoleSettingFromCache();
    return !!this.consoleSetting?.enable && !!this.consoleSetting?.enableError;
  }

  /**
   * 是否打印统计日志
   * @returns 
   */
  isEnableCountLog(){
    this._getConsoleSettingFromCache();
    return !!this.consoleSetting?.enable && !!this.consoleSetting?.enableCount;
  }

  /**
   * 打印信息到控制台
   */
  print(params: { msg: string }) {
    console.log(params.msg);
  }
}

export default ConsoleManager;
