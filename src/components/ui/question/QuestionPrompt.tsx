import type { ReactNode } from "react";
import { getImageUrl } from "@/utils/image-url";
import { Separator } from "../separator";

export interface QuestionPhoto {
  id: number;
  key: string;
  originalFileName?: string;
  orderIndex?: number;
}

interface QuestionPromptProps {
  question: string;
  additionalText?: string | null;
  photos?: QuestionPhoto[] | null;
  children?: ReactNode;
}

export const QuestionPrompt = ({
  question,
  additionalText,
  photos,
  children,
}: QuestionPromptProps) => {
  const sortedPhotos = [...(photos ?? [])].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
          {question}
          {children}
        </h2>

        {additionalText && (
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {additionalText}
          </p>
        )}
      </div>

      {sortedPhotos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedPhotos.map(photo => (
            <img
              key={photo.id}
              src={getImageUrl(photo.key)}
              alt={photo.originalFileName || `문제 이미지 ${photo.id}`}
              className="max-h-80 w-full rounded-lg border object-contain bg-muted/20"
              loading="lazy"
            />
          ))}
        </div>
      )}

      <Separator className="mt-2 mb-3" />
    </div>
  );
};
