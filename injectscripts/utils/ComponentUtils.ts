import { getComponentMetadata } from './VjsUtils';

/**
 * 获取构件名称
 * @param sandbox 
 * @param componentCode 
 * @returns 
 */
export function getComponentTitle(componentCode) {
  const metadata = getComponentMetadata(componentCode);
  return metadata?.$?.name;
}
