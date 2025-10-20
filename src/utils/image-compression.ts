import imageCompression from "browser-image-compression";

// 압축 옵션 타입
export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
  initialQuality?: number;
}

// 기본 압축 옵션 (5MB 이하)
const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSizeMB: 1.2,
  maxWidthOrHeight: 3000,
  useWebWorker: true,
  initialQuality: 0.9,
};

/**
 * HEIC 파일을 JPG로 변환합니다.
 * @param file HEIC 파일
 * @returns JPG로 변환된 파일
 */
async function convertHeicToJpg(file: File): Promise<File> {
  try {
    const heic2any = (await import("heic2any")).default;

    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });

    // heic2any는 Blob 또는 Blob[]을 반환할 수 있음
    const blob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    // Blob을 File로 변환
    const originalName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    return new File([blob], originalName, { type: "image/jpeg" });
  } catch (error) {
    console.error("HEIC 변환 중 오류 발생:", error);
    throw new Error("HEIC 파일 변환에 실패했습니다.");
  }
}

/**
 * 파일이 HEIC 파일인지 확인합니다.
 * @param file 확인할 파일
 * @returns HEIC 파일 여부
 */
function isHeicFile(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return (
    extension === "heic" ||
    extension === "heif" ||
    file.type === "image/heic" ||
    file.type === "image/heif"
  );
}

/**
 * 단일 이미지 파일을 압축합니다.
 * @param file 압축할 이미지 파일
 * @param options 압축 옵션
 * @returns 압축된 파일
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  try {
    // HEIC 파일이면 먼저 JPG로 변환
    let processedFile = file;
    if (isHeicFile(file)) {
      console.log("HEIC 파일 감지, JPG로 변환 중...");
      processedFile = await convertHeicToJpg(file);
    }

    const compressionOptions = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };

    // 파일이 이미 3MB 이하면 가벼운 최적화만 수행
    if (processedFile.size <= 3 * 1024 * 1024) {
      const lightOptions = {
        ...compressionOptions,
        quality: 0.9,
        initialQuality: 0.9,
      };
      return await imageCompression(processedFile, lightOptions);
    }

    const compressedFile = await imageCompression(
      processedFile,
      compressionOptions
    );

    // 압축 후에도 크기가 클 경우 품질을 더 낮춰서 재압축
    if (compressedFile.size > compressionOptions.maxSizeMB! * 1024 * 1024) {
      const retryOptions = {
        ...compressionOptions,
        quality: 0.6,
        initialQuality: 0.6,
      };
      return await imageCompression(processedFile, retryOptions);
    }

    return compressedFile;
  } catch (error) {
    console.error("이미지 압축 중 오류 발생:", error);
    throw new Error("이미지 압축에 실패했습니다.");
  }
}

/**
 * 여러 이미지 파일들을 한번에 압축합니다.
 * @param files 압축할 이미지 파일 배열
 * @param options 압축 옵션
 * @param onProgress 진행률 콜백 함수
 * @returns 압축된 파일들의 배열
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (
    progress: number,
    currentIndex: number,
    totalCount: number
  ) => void
): Promise<File[]> {
  const compressedFiles: File[] = [];
  const totalCount = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      onProgress?.(Math.round((i / totalCount) * 100), i, totalCount);

      const compressedFile = await compressImage(file, options);
      compressedFiles.push(compressedFile);
    } catch (error) {
      console.error(`파일 ${file.name} 압축 실패:`, error);
      compressedFiles.push(file);
    }
  }

  onProgress?.(100, totalCount, totalCount);

  return compressedFiles;
}

/**
 * 파일 크기를 읽기 쉬운 형태로 포맷합니다.
 * @param bytes 바이트 크기
 * @returns 포맷된 크기 문자열
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * 허용된 이미지 확장자인지 확인합니다.
 * @param file 확인할 파일
 * @param allowedExtensions 허용된 확장자 배열
 * @returns 허용된 확장자 여부
 */
export function isAllowedImageExtension(
  file: File,
  allowedExtensions: string[] = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "heic",
  ]
): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}
