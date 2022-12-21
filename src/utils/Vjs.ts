import { toFileSize } from "./NumberUtils";

class Vjs {
  name: string;
  size: number;
  deps: string[];

  constructor(name: string, size: number, deps: string[]) {
    this.name = name;
    this.size = size;
    this.deps = deps;
  }

  getName() {
    return this.name;
  }

  getSize() {
    return this.size;
  }

  getFormatSize() {
    return toFileSize(this.size);
  }

  getDeps() {
    return this.deps;
  }
}

export default Vjs;
