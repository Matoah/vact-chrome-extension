import { getVjsContent as getMockVjsContent } from "../utils/MockUtils";

export function getVjsContent(
  id: string,
  success: (content: string) => void,
  fail?: (e: any) => void
) {
  //@ts-ignore
  if (window.vact_devtools && window.vact_devtools.sendRequest) {
    //@ts-ignore
    const promise = window.vact_devtools.sendRequest("getVjsContent", {
      id: id,
    });
    promise
      .then((content: string) => {
        success(content);
      })
      .catch((e: any) => {
        if (fail) {
          fail(e);
        }
      });
  } else {
    success(getMockVjsContent());
  }
}
