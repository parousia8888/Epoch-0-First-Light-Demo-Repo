// ============================================================
// core/ImageDrop.tsx — 拍照/上传组件(yakusho、gomi 两个 vision demo 用)
// 手机上点它会直接唤起相机。选图后在浏览器里压到最长边 1024px、
// 质量 0.8,再转成 dataURL 交给页面——省流量,也不碰服务器存储。
// ============================================================
"use client";

import { useRef, useState } from "react";

interface Props {
  /** 压缩完的 dataURL 会通过这里交给页面 */
  onImage: (dataUrl: string) => void;
  /** 按钮文案,默认「📷 拍照 / 选择图片」 */
  label?: string;
  className?: string;
}

const MAX_EDGE = 1024;
const QUALITY = 0.8;

async function compress(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", QUALITY);
}

export function ImageDrop({ onImage, label = "📷 拍照 / 选择图片", className = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await compress(file);
      setPreview(dataUrl);
      onImage(dataUrl);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {preview ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="预览" className="w-full max-h-64 object-contain rounded" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full py-2 text-sm opacity-70 underline underline-offset-4"
          >
            重拍 / 换一张
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="w-full py-10 border-2 border-dashed border-current/40 rounded-lg text-center opacity-80 active:opacity-60 transition-opacity"
        >
          {busy ? "压缩中…" : label}
        </button>
      )}
    </div>
  );
}
