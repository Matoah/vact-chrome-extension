import { ExposeMethod } from '../types/Types';
import LocalStorageManager from './private/LocalStorageManager';
import MonitorDataManager from './private/MonitorDataManager';

class MonitorManager implements ExposeMethod {
    
  private static INSTANCE = new MonitorManager();

  static getInstance() {
    return MonitorManager.INSTANCE;
  }

  manager: LocalStorageManager = LocalStorageManager.getInstance();

  monitorDataManager: MonitorDataManager = MonitorDataManager.getInstance();

  getExposeMethods(): string[] | undefined {
    return undefined;
  }

  getUnExposeMethods(): string[] | undefined {
    return ["getInstance"];
  }

  /**
   * 是否在统计前端耗时
   */
  isMonitored() {
    return this.manager.get(this.manager.KEYS.isMonitored) == "true";
  }

  /**
   * 开始记录前端耗时统计
   */
  markMonitored() {
    this.manager.set(this.manager.KEYS.isMonitored, "true");
  }

  /**
   * 结束记录前端耗时统计
   */
  markUnMonitored() {
    this.manager.set(this.manager.KEYS.isMonitored, "false");
  }

  /**
   * 清除前端耗时数据
   */
  clearMonitorData() {
    this.monitorDataManager.clear();
  }

  /**
   * 获取前端耗时数据
   */
  getMonitorDatas(params?: { key: string }) {
    return this.monitorDataManager.genViewTimePoint(
      params ? params.key : undefined
    );
  }
}

export default MonitorManager;
