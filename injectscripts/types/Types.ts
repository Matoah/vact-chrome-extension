interface Breakpoint {
  enable: boolean;
  location: {
    componentCode: string;
    windowCode?: string;
    methodCode: string;
    ruleCode: string;
  };
}

interface ConsoleSetting {
  enable?: boolean;
  enableDebug?: boolean;
  enableInfo?: boolean;
  enableWarn?: boolean;
  enableError?: boolean;
}

interface ExposeMethod {
}

interface Sandbox {
  getService: (name: string) => any;
}

export { Breakpoint, ConsoleSetting, ExposeMethod, Sandbox };
