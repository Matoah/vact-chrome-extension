import Vjs from './Vjs';

class VjsContentAnalysis {
  content: string;

  constructor(content: string) {
    this.content = content;
  }

  analyze(): Vjs[] {
    let size = 0;
    let index = 0;
    let strStack = [];
    let bracketStack: string[] = [];
    let defineJson = [];
    const len = this.content.length;
    const result: Vjs[] = [];
    while (index < len) {
      const ch = this.content.charAt(index);
      if (bracketStack.length > 0) {
        defineJson.push(ch);
      }
      if (ch == "d" && strStack.length == 0) {
        const str = this.content.substring(index, index + 10);
        if (str == "defineVJS(") {
          bracketStack.push("(");
          size += 9;
          index += 9;
        }
      } else if (ch == "(" && bracketStack.length > 0 && strStack.length == 0) {
        const bracket = bracketStack.pop();
        if (bracket !== ")") {
          if (bracket) {
            bracketStack.push(bracket);
          }
          bracketStack.push(ch);
        }
      } else if (ch == ")" && bracketStack.length > 0 && strStack.length == 0) {
        const bracket = bracketStack.pop();
        if (bracket !== "(") {
          if (bracket) {
            bracketStack.push(bracket);
          }
          bracketStack.push(ch);
        } else {
          if (bracketStack.length == 0) {
            defineJson.pop();
            let defineStr = defineJson.join("");
            let define = JSON.parse(defineStr);
            result.push(new Vjs(define.name, size + 1));
            size = -1;
            defineJson = [];
            bracketStack = [];
          }
        }
      }
      size++;
      index++;
    }
    return result;
  }
}

export default VjsContentAnalysis;
