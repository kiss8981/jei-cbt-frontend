"use client";

import { useEffect, useRef, useState } from "react";
import { Editor, EditorContent, NodeViewRendererProps, useEditor } from "@tiptap/react";
import { mergeAttributes, Node } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import FileHandler from "@tiptap/extension-file-handler";
import Placeholder from "@tiptap/extension-placeholder";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import HighlightExtension from "@tiptap/extension-highlight";
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Code2, FileImage, Highlighter,
  Italic, Link2, List, ListOrdered, ListTodo, Paperclip, Palette, Redo,
  Underline as UnderlineIcon, Undo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useS3PresignedUrls, uploadFilesToS3 } from "@/app/admin/_hooks/apis/useUpload";
import { compressImage, formatFileSize } from "@/utils/image-compression";
import { toast } from "sonner";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "bmp", "webp", "heic", "heif", "pdf",
  "doc", "docx", "xls", "xlsx", "ppt", "pptx", "hwp", "hwpx", "txt",
  "csv", "zip",
]);
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
  bmp: "image/bmp", webp: "image/webp", heic: "image/heic", heif: "image/heif",
  pdf: "application/pdf", doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  hwp: "application/x-hwp", hwpx: "application/vnd.hancom.hwpx",
  txt: "text/plain", csv: "text/csv", zip: "application/zip",
};

const ResizableImage = Image.extend({
  name: "resizableImage",
  addAttributes() {
    return {
      ...this.parent?.(),
      assetId: {
        default: null,
        parseHTML: element => element.getAttribute("data-asset-id"),
        renderHTML: attributes => ({ "data-asset-id": attributes.assetId }),
      },
      width: {
        default: null,
        parseHTML: element => element.getAttribute("width"),
        renderHTML: attributes => attributes.width ? { width: attributes.width } : {},
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes, { class: "max-w-full h-auto rounded-lg" })];
  },
  addNodeView() {
    return ({ node, editor, getPos }: NodeViewRendererProps) => {
      const wrapper = document.createElement("span");
      wrapper.className = "relative my-2 inline-block max-w-full align-top group";
      const image = document.createElement("img");
      image.src = node.attrs.src;
      image.alt = node.attrs.alt ?? "";
      image.className = "max-w-full h-auto rounded-lg";
      if (node.attrs.width) image.style.width = `${node.attrs.width}px`;
      wrapper.dataset.assetId = String(node.attrs.assetId ?? "");
      wrapper.appendChild(image);

      if (editor.isEditable) {
        const handle = document.createElement("button");
        handle.type = "button";
        handle.title = "이미지 크기 조절";
        handle.className = "absolute -bottom-2 -right-2 h-5 w-5 cursor-se-resize rounded-full border-2 border-white bg-blue-600 opacity-0 group-hover:opacity-100";
        handle.addEventListener("mousedown", event => {
          event.preventDefault();
          const startX = event.clientX;
          const startWidth = image.getBoundingClientRect().width;
          const onMove = (moveEvent: MouseEvent) => {
            image.style.width = `${Math.max(120, startWidth + moveEvent.clientX - startX)}px`;
          };
          const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            const pos = typeof getPos === "function" ? getPos() : undefined;
            if (typeof pos === "number") {
              editor.commands.command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  width: Math.round(image.getBoundingClientRect().width),
                });
                return true;
              });
            }
          };
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
        });
        wrapper.appendChild(handle);
      }
      return { dom: wrapper };
    };
  },
});

const FileLink = Node.create({
  name: "fileLink",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      assetId: { default: null }, href: { default: null },
      fileName: { default: "첨부파일" }, fileSize: { default: "" },
    };
  },
  parseHTML() {
    return [{
      tag: "div[data-file-link]",
      getAttrs: element => {
        const el = element as HTMLElement;
        const link = el.querySelector("a");
        return {
          assetId: el.getAttribute("data-asset-id"), href: link?.getAttribute("href"),
          fileName: el.getAttribute("data-file-name") ?? link?.textContent ?? "첨부파일",
          fileSize: el.getAttribute("data-file-size") ?? "",
        };
      },
    }];
  },
  renderHTML({ node }) {
    return [
      "div",
      {
        "data-file-link": "", "data-asset-id": node.attrs.assetId,
        "data-file-name": node.attrs.fileName, "data-file-size": node.attrs.fileSize,
        class: "my-2",
      },
      [
        "a",
        {
          href: node.attrs.href, target: "_blank", rel: "noopener noreferrer",
          "data-asset-id": node.attrs.assetId,
          class: "inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700 no-underline",
        },
        `📎 ${node.attrs.fileName} ${node.attrs.fileSize ? `(${node.attrs.fileSize})` : ""}`,
      ],
    ];
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const wrapper = document.createElement("div");
      wrapper.className = "group relative my-2 inline-flex max-w-full";
      wrapper.dataset.assetId = String(node.attrs.assetId);
      const link = document.createElement("a");
      link.href = node.attrs.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "inline-flex max-w-full items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 no-underline";
      link.textContent = `📎 ${node.attrs.fileName}${node.attrs.fileSize ? ` (${node.attrs.fileSize})` : ""}`;
      wrapper.appendChild(link);
      if (editor.isEditable) {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "×";
        remove.className = "absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100";
        remove.onclick = event => {
          event.preventDefault();
          const pos = typeof getPos === "function" ? getPos() : undefined;
          if (typeof pos === "number") editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
        };
        wrapper.appendChild(remove);
      }
      return { dom: wrapper };
    };
  },
});

function getAssetIds(html: string) {
  return [...new Set(Array.from(
    html.matchAll(/data-asset-id=["'](\d+)["']/g),
    match => Number(match[1])
  ))];
}

export function NoticeEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string, assetIds: number[]) => void;
}) {
  const { getPresignedUrls } = useS3PresignedUrls();
  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [htmlOpen, setHtmlOpen] = useState(false);
  const [htmlSource, setHtmlSource] = useState("");

  const upload = async (rawFiles: File[], currentEditor: Editor, pos?: number) => {
    const currentCount = getAssetIds(currentEditor.getHTML()).length;
    if (currentCount + rawFiles.length > MAX_FILES) {
      toast.error(`첨부파일은 게시글당 최대 ${MAX_FILES}개까지 가능합니다.`);
      return;
    }
    const validFiles = rawFiles.filter(file => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      return ALLOWED_EXTENSIONS.has(extension) && file.size <= MAX_FILE_SIZE;
    });
    if (validFiles.length !== rawFiles.length) {
      toast.error("지원하지 않는 형식이거나 50MB를 초과한 파일은 제외했습니다.");
    }
    if (!validFiles.length) return;

    setIsUploading(true);
    try {
      setProgress("파일 준비 중...");
      const prepared = await Promise.all(validFiles.map(async file => {
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
        const normalized = file.type
          ? file
          : new File([file], file.name, { type: MIME_BY_EXTENSION[extension] });
        return normalized.type.startsWith("image/")
          ? compressImage(normalized)
          : normalized;
      }));
      const presigned = await getPresignedUrls(prepared, "NOTICE");
      const uploads = presigned.map((item, index) => ({
        file: prepared[index], uploadUrl: item.uploadUrl, key: item.key,
      }));
      const uploadedKeys = await uploadFilesToS3(uploads, (_pct, done, total) => {
        setProgress(`S3 업로드 중... (${done}/${total})`);
      });
      const success = new Set(uploadedKeys);
      const nodes: Array<{ type: string; attrs: Record<string, unknown> }> = [];
      presigned.forEach((item, index) => {
        if (!success.has(item.key)) return;
        const file = prepared[index];
        if (file.type.startsWith("image/")) {
          nodes.push({
            type: "resizableImage",
            attrs: {
              src: item.publicUrl, alt: item.fileName,
              assetId: item.uploadId, width: null,
            },
          });
          return;
        }
        nodes.push({
          type: "fileLink",
          attrs: {
            href: item.publicUrl, fileName: item.fileName,
            fileSize: formatFileSize(item.size), assetId: item.uploadId,
          },
        });
      });
      if (typeof pos === "number") {
        currentEditor.chain().focus().insertContentAt(pos, nodes).run();
      } else {
        currentEditor.chain().focus().insertContent(nodes).run();
      }
      if (nodes.length !== prepared.length) toast.error("일부 파일 업로드에 실패했습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "파일 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      setProgress("");
    }
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextStyle,
      FontSize,
      Color,
      HighlightExtension.configure({ multicolor: true }),
      ResizableImage,
      FileLink,
      Placeholder.configure({ placeholder: "게시글 내용을 입력하세요." }),
      FileHandler.configure({
        onDrop: (currentEditor, files, pos) => void upload(files, currentEditor, pos),
        onPaste: (currentEditor, files) => {
          const images = files.filter(file => file.type.startsWith("image/"));
          if (images.length) void upload(images, currentEditor);
        },
      }),
    ],
    content,
    editable: !isUploading,
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML();
      onChange(html, getAssetIds(html));
    },
    editorProps: {
      attributes: {
        class: "min-h-[360px] max-w-none px-4 py-3 focus:outline-none [&_img]:max-w-full [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  const button = (label: string, action: () => void, active = false) => (
    <Button type="button" size="icon" variant={active ? "default" : "outline"} title={label} onClick={action} disabled={isUploading}>
      {label === "굵게" ? <Bold /> : label === "기울임" ? <Italic /> : label === "밑줄" ? <UnderlineIcon /> : null}
    </Button>
  );

  return (
    <div className="relative overflow-hidden rounded-xl border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2">
        <Button type="button" size="icon" variant="outline" title="실행 취소" onClick={() => editor.chain().focus().undo().run()}><Undo /></Button>
        <Button type="button" size="icon" variant="outline" title="다시 실행" onClick={() => editor.chain().focus().redo().run()}><Redo /></Button>
        {button("굵게", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
        {button("기울임", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
        {button("밑줄", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
        <Button type="button" size="icon" variant="outline" title="왼쪽 정렬" onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft /></Button>
        <Button type="button" size="icon" variant="outline" title="가운데 정렬" onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter /></Button>
        <Button type="button" size="icon" variant="outline" title="오른쪽 정렬" onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight /></Button>
        <Button type="button" size="icon" variant="outline" title="글머리 목록" onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></Button>
        <Button type="button" size="icon" variant="outline" title="번호 목록" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></Button>
        <Button type="button" size="icon" variant="outline" title="체크 목록" onClick={() => editor.chain().focus().toggleTaskList().run()}><ListTodo /></Button>
        <select className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue="" onChange={event => event.target.value ? editor.chain().focus().setFontSize(event.target.value).run() : editor.chain().focus().unsetFontSize().run()}>
          <option value="">기본 크기</option><option value="14px">14px</option><option value="16px">16px</option><option value="20px">20px</option><option value="24px">24px</option><option value="32px">32px</option>
        </select>
        <label className="flex h-9 items-center gap-1 rounded-md border bg-background px-2 text-sm" title="글자 색상"><Palette className="size-4" /><input type="color" onChange={event => editor.chain().focus().setColor(event.target.value).run()} /></label>
        <label className="flex h-9 items-center gap-1 rounded-md border bg-background px-2 text-sm" title="강조 색상"><Highlighter className="size-4" /><input type="color" onChange={event => editor.chain().focus().toggleHighlight({ color: event.target.value }).run()} /></label>
        <Button type="button" size="icon" variant="outline" title="링크" onClick={() => { const href = window.prompt("링크 주소를 입력하세요."); if (href) editor.chain().focus().extendMarkRange("link").setLink({ href, target: "_blank" }).run(); }}><Link2 /></Button>
        <Button type="button" size="icon" variant="outline" title="이미지 업로드" onClick={() => imageInput.current?.click()}><FileImage /></Button>
        <Button type="button" size="icon" variant="outline" title="파일 첨부" onClick={() => fileInput.current?.click()}><Paperclip /></Button>
        <Button type="button" size="icon" variant="outline" title="HTML 소스" onClick={() => { setHtmlSource(editor.getHTML()); setHtmlOpen(true); }}><Code2 /></Button>
        <input ref={imageInput} className="hidden" type="file" multiple accept="image/*,.heic,.heif" onChange={event => { if (event.target.files) void upload(Array.from(event.target.files), editor); event.currentTarget.value = ""; }} />
        <input ref={fileInput} className="hidden" type="file" multiple accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.heic,.heif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.hwpx,.txt,.csv,.zip" onChange={event => { if (event.target.files) void upload(Array.from(event.target.files), editor); event.currentTarget.value = ""; }} />
      </div>
      <EditorContent editor={editor} />
      {isUploading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 text-sm font-medium backdrop-blur-sm">{progress}</div>}
      <Dialog open={htmlOpen} onOpenChange={setHtmlOpen}>
        <DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>HTML 소스 편집</DialogTitle></DialogHeader><Textarea className="min-h-96 font-mono text-sm" value={htmlSource} onChange={event => setHtmlSource(event.target.value)} /><DialogFooter><Button type="button" variant="outline" onClick={() => setHtmlOpen(false)}>취소</Button><Button type="button" onClick={() => { editor.commands.setContent(htmlSource); setHtmlOpen(false); }}>적용</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
