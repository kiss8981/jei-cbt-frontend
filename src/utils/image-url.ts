const CDN_URL = "https://jei-cbt-project.s3.ap-northeast-2.amazonaws.com";

/**
 * CDN URL과 이미지 경로를 조합하여 완전한 이미지 URL을 생성합니다.
 * @param imagePath 이미지 경로
 * @returns 완전한 이미지 URL
 */
export const getImageUrl = (imagePath: string): string => {
  return `${CDN_URL}/${imagePath}`;
};
