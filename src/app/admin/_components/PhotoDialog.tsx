import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { GetPhotoMappingAdminDto } from "@/lib/http/apis/dtos/admin/upload/get-photo-mapping.admin.dto";
import {
  uploadFilesToS3,
  usePhoto,
  useS3PresignedUrls,
} from "../_hooks/apis/useUpload";
import { getImageUrl } from "@/utils/image-url";
import { compressImages } from "@/utils/image-compression";
import { UpdatePhotoMappingAdminDto } from "@/lib/http/apis/dtos/admin/upload/update-photo-mapping.admin.dto";
import { adminHttp, BaseResponse } from "@/lib/http/admin-http";
import { Label } from "@/components/ui/label";

interface PhotoManagementDialogProps {
  endpoint: string;
  photos: GetPhotoMappingAdminDto[];
  onClose?: () => void;
}

interface PhotoItem {
  id: string;
  name: string;
  url: string;
  file?: File;
  isExisting?: boolean;
}

export function PhotoDialog({
  endpoint,
  photos: initialPhotos,
  onClose,
}: PhotoManagementDialogProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>(
    initialPhotos.map(photo => ({
      id: photo.key,
      name: photo.originalFileName,
      url: getImageUrl(photo.key),
      isExisting: true,
    }))
  );
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newPhotos, setNewPhotos] = useState<PhotoItem[]>([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getPresignedUrls } = useS3PresignedUrls();

  useEffect(() => {
    setPhotos(
      initialPhotos.map(photo => ({
        id: photo.key,
        name: photo.originalFileName,
        url: getImageUrl(photo.key),
        isExisting: true,
      }))
    );
  }, [initialPhotos]);

  const allowedExtensions = ["jpg", "jpeg", "gif", "png", "bmp", "heic"];

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };

  const validateFile = (file: File): boolean => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  };

  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(validateFile);

    if (validFiles.length < files.length) {
      alert(
        "지원하지 않는 파일 형식이 포함되어 있습니다. (jpg, jpeg, gif, png, bmp, heic만 허용)"
      );
    }

    if (validFiles.length === 0) return;

    const newPhotoItems: PhotoItem[] = validFiles.map(file => ({
      id: `new-${Date.now()}-${file.name}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));

    setNewPhotos(prev => [...prev, ...newPhotoItems]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // 기존 사진 삭제 (임시 - 화면에서만 제거)
  const handleDeleteExistingPhoto = (photoId: string) => {
    setDeletedPhotoIds(prev => [...prev, photoId]);
  };

  // 변경사항 계산
  const hasChanges = newPhotos.length > 0 || deletedPhotoIds.length > 0;
  const totalChanges = newPhotos.length + deletedPhotoIds.length;

  const handleDeleteNewPhoto = (photoId: string) => {
    setNewPhotos(prev => {
      const photoToDelete = prev.find(p => p.id === photoId);
      if (photoToDelete?.url.startsWith("blob:")) {
        URL.revokeObjectURL(photoToDelete.url);
      }
      return prev.filter(p => p.id !== photoId);
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      setIsUploading(true);

      const filesToUpload = newPhotos.filter(p => p.file);
      const hasPhotosToUpload = filesToUpload.length > 0;
      const hasPhotosToDelete = deletedPhotoIds.length > 0;

      // 변경사항이 없으면 중단
      if (!hasPhotosToUpload && !hasPhotosToDelete) {
        alert("변경사항이 없습니다.");
        return;
      }

      const dtos: UpdatePhotoMappingAdminDto[] = [];

      // 2. 새로 업로드할 사진 처리
      if (hasPhotosToUpload) {
        // 사진 압축
        const compressedFiles = await compressImages(
          filesToUpload.map(p => p.file!),
          {}
        );

        const filenames = compressedFiles.map((file, idx) => file.name);
        const presignedUrls = await getPresignedUrls(filenames);

        const uploads = presignedUrls.map((urlData, idx) => ({
          file: compressedFiles[idx],
          uploadUrl: urlData.uploadUrl,
          key: urlData.key,
        }));

        const uploadedKeys = await uploadFilesToS3(uploads);

        if (uploadedKeys.length === 0) {
          throw new Error("S3 업로드에 성공한 파일이 없습니다.");
        }

        // uploadUrl 배열 추출
        const uploadUrls = presignedUrls.map(urlData => urlData.key);

        // DTO 생성
        uploadUrls.forEach(key => {
          dtos.push({
            key,
            orderIndex: 0,
          });
        });
      }

      // 3. 삭제할 사진 처리
      if (hasPhotosToDelete) {
        for (const photoId of deletedPhotoIds) {
          dtos.push({
            key: photoId,
            orderIndex: 0,
            delete: true,
          });
        }
      }

      const { data } = await adminHttp.put<BaseResponse<any>>(endpoint, {
        photos: dtos,
      });

      if (data.code !== 200) {
        throw new Error(data.message || "사진 업데이트에 실패했습니다.");
      }

      // 새 사진 목록 초기화
      newPhotos.forEach(photo => {
        if (photo.url.startsWith("blob:")) {
          URL.revokeObjectURL(photo.url);
        }
      });
      setNewPhotos([]);
      setDeletedPhotoIds([]);

      const message = [];
      if (hasPhotosToDelete) message.push(`${deletedPhotoIds.length}개 삭제`);
      if (hasPhotosToUpload) message.push(`${filesToUpload.length}개 추가`);

      alert(`변경사항이 저장되었습니다. (${message.join(", ")})`);

      handleOpenChange(false);

      return;
    } catch (error) {
      console.error("사진 업로드 실패:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          alert("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
        } else if (
          error.message.includes("size") ||
          error.message.includes("5MB")
        ) {
          alert(
            "파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다."
          );
        } else if (error.message.includes("압축")) {
          alert(
            "이미지 압축 중 오류가 발생했습니다. 다른 이미지를 시도해주세요."
          );
        } else if (error.message.includes("Presigned")) {
          alert("업로드 URL 발급에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } else if (error.message.includes("S3")) {
          alert("파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
        } else {
          alert(`업로드 실패: ${error.message}`);
        }
      } else {
        alert("알 수 없는 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // 화면에 표시할 사진 목록 (삭제 예정 사진 제외)
  const visiblePhotos = photos.filter(
    photo => !deletedPhotoIds.includes(photo.id)
  );
  const allPhotos = [...visiblePhotos, ...newPhotos];
  const totalCount = allPhotos.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <div className="flex flex-col items-start">
        <Label className="text-lg">사진 관리</Label>
        <div className="flex items-start space-x-2">
          {photos.map(photo => (
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.name}
              // 풀사이즈 이미지
              className="h-52 object-cover rounded-md border"
            />
          ))}
        </div>
      </div>
      <DialogTrigger asChild>
        <Button variant="outline" size="default" className="mt-2 w-fit">
          업로드 / 수정 <Upload size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>이미지 관리</DialogTitle>
          <DialogDescription>
            등록된 이미지: {visiblePhotos.length}개 | 새로 추가된 이미지:{" "}
            {newPhotos.length}개
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-3 overflow-x-auto">
            <h4 className="text-sm font-medium">
              등록된 이미지 ({totalCount}개)
            </h4>
            <div className="flex gap-3 p-4 border rounded-lg overflow-x-auto min-h-[200px] max-w-full">
              {allPhotos.length === 0 ? (
                <div className="flex items-center justify-center w-full text-gray-500 text-sm min-w-0">
                  등록된 사진이 없습니다
                </div>
              ) : (
                <div className="flex gap-3 min-w-max">
                  {allPhotos.map(photo => (
                    <div
                      key={photo.id}
                      className="relative group flex-shrink-0"
                    >
                      <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                        {photo.isExisting ? (
                          <img
                            src={photo.url}
                            alt={photo.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          photo.isExisting
                            ? handleDeleteExistingPhoto(photo.id)
                            : handleDeleteNewPhoto(photo.id)
                        }
                        disabled={isUploading}
                      >
                        <Trash2 size={12} />
                      </Button>
                      {!photo.isExisting && (
                        <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                          새로 추가
                        </span>
                      )}
                      <p className="text-xs text-center mt-1 truncate w-32">
                        {photo.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 파일 업로드 영역 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">사진 업로드</h4>
              <span className="text-xs text-gray-500">
                허용 확장자: {allowedExtensions.join(", ")}
              </span>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
              } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.gif,.png,.bmp"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />

              <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <div className="space-y-2 flex flex-col justify-center items-center">
                <p className="text-sm text-gray-600">
                  {isUploading
                    ? "업로드 중..."
                    : "사진을 여기로 드래그하거나 클릭하여 업로드하세요"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openFileDialog}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <Upload size={14} />
                  사진 업로드
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isUploading}
            onClick={() => handleOpenChange(false)}
          >
            닫기
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isUploading || !hasChanges}
          >
            {isUploading ? "업로드 중..." : `변경사항 저장 (${totalChanges})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
