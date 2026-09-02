export interface NoticeAsset {
  id: number;
  key: string;
  publicUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  kind: "IMAGE" | "FILE";
  orderIndex: number;
}

export interface NoticeSummary {
  id: number;
  title: string;
  isPublished: boolean;
  authorName: string;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeDetail extends NoticeSummary {
  contentHtml: string;
  assets: NoticeAsset[];
}

export interface NoticeWritePayload {
  title: string;
  contentHtml: string;
  isPublished: boolean;
  assetIds: number[];
}

