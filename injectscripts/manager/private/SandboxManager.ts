import { Sandbox } from '../../types/Types';

class SandboxManager {
  private static INSTANCE = new SandboxManager();

  static getInstance() {
    return SandboxManager.INSTANCE;
  }

  /**
   * vjs沙箱
   */
  sandbox: null | Sandbox = null;

  get(): Sandbox {
    if (this.sandbox == null) {
      throw Error("sandbox未初始化，无法获取！");
    } else {
      return this.sandbox;
    }
  }

  set(sandbox: Sandbox) {
    this.sandbox = sandbox;
  }
}

export default SandboxManager;
