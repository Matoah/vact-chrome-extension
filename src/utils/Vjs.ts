import { toFileSize } from './NumberUtils';

class Vjs {
  name: string;
  size: number;
  deps: string[];
  impls?: Array<{ name: string; condition: string | null }>;

  constructor(
    name: string,
    size: number,
    deps: string[],
    impls?: Array<{ name: string; condition: string | null }>
  ) {
    this.name = name;
    this.size = size;
    this.deps = deps;
    this.impls = impls;
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

  getImpls() {
    return this.impls;
  }
}

export default Vjs;
