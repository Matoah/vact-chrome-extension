import { toFileSize } from './NumberUtils';

class Vjs {
  name: string;
  size: number;

  constructor(name: string, size: number) {
    this.name = name;
    this.size = size;
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
}

export default Vjs;
