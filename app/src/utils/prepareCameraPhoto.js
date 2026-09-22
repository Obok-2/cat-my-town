import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

const MAX_LONG_EDGE = 1280;
const JPEG_QUALITY = 0.82;

// 카메라 원본은 기기에 따라 수천 px까지 커진다. 판별·업로드에는 긴 변 1280px이면 충분하므로
// 비율을 유지해 축소하고 JPEG로 한 번 더 압축한다. 작은 사진은 크기를 키우지 않는다.
export async function prepareCameraPhoto(photo) {
  const width = photo?.width ?? 0;
  const height = photo?.height ?? 0;
  const bareWebBase64 = Platform.OS === 'web' && !/^(data:|blob:|https?:)/.test(photo.uri);
  const sourceUri = bareWebBase64 ? `data:image/jpeg;base64,${photo.uri}` : photo.uri;
  const context = ImageManipulator.manipulate(sourceUri);

  if (Math.max(width, height) > MAX_LONG_EDGE) {
    if (width >= height) {
      context.resize({ width: MAX_LONG_EDGE, height: null });
    } else {
      context.resize({ width: null, height: MAX_LONG_EDGE });
    }
  }

  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
  };
}
