import { getWindowMetadata } from './VjsUtils';

/**
 * 获取窗体名称
 * @param sandbox 
 * @param componentCode 
 * @param windowCode 
 * @returns 
 */
export function getWindowTitle(componentCode, windowCode) {
  const metadata = getWindowMetadata(componentCode, windowCode);
  return metadata?.$?.name;
}
