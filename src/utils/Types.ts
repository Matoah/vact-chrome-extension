interface Breakpoint {
  enable: boolean;
  location: {
    componentCode: string;
    windowCode?: string;
    methodCode: string;
    ruleCode: string;
  };
}

interface Operations {
  [operation: string]: {
    disabled: boolean;
    active: boolean;
  };
}

export { type Breakpoint, type Operations };
