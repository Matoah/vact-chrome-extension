interface Breakpoint {
  enable: boolean;
  location: {
    componentCode: string;
    windowCode?: string;
    methodCode: string;
    ruleCode: string;
  };
}

export { type Breakpoint };
