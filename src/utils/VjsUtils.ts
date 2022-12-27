import { getVjsContent as getRPCVjsContent } from "../utils/RPCUtils";

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
