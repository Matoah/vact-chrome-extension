import FrontendJSON from './FrontendJSON';

export function toJson(obj: {}, keepDsContructor?: boolean) {
  const json = new FrontendJSON(obj, keepDsContructor);
  return json.parse();
}
