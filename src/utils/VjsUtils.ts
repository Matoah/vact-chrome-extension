import { getVjsContent as getRPCVjsContent } from '../utils/RPCUtils';

export function getVjsContent(
  id: string,
  success: (content: string) => void,
  fail?: (e: any) => void
) {
  getRPCVjsContent(id)
    .then(success)
    .catch((e: any) => {
      if (fail) {
        fail(e);
      }
    });
}

export function isWindowSchemaVjs(vjsName:string){
  return vjsName.startsWith("vact.vjs.framework.extension.platform.init.view.schema.window.")
}

export function isComponentSchemVjs(vjsName:string){
  return vjsName.startsWith("vact.vjs.framework.extension.platform.init.view.schema.component.");
}

export function getCodeFromWindowVjsName(vjsName:string):{componentCode:string,windowCode:string}{
  const list = vjsName.split('.');
  const componentCode = list[9];
  const windowCode = list[10]
  return {componentCode,windowCode}
}

export function getCodeFromComponeentVjsName(vjsName:string){
  const list = vjsName.split('.');
  return list[9];
}