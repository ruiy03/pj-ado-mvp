'use client';

import {useState, useRef} from 'react';
import Image from 'next/image';

interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  imageId?: number;
}

interface ImageUploadProps {
  onUpload: (image: UploadedImage) => void;
  onRemove?: () => void;
  currentImageUrl?: string;
  placeholder?: string;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
  adContentId?: number;
  placeholderName?: string;
  altText?: string;
}

export default function ImageUpload({
                                      onUpload,
                                      onRemove,
                                      currentImageUrl,
                                      placeholder = '画像をドラッグ&ドロップまたはクリックして選択',
                                      maxSizeMB = 5,
                                      className = '',
                                      disabled = false,
                                      adContentId,
                                      placeholderName,
                                      altText,
                                    }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (disabled) return;

    setError(null);
    setUploading(true);

    try {
      // ファイルサイズチェック
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`ファイルサイズが大きすぎます。最大${maxSizeMB}MBまでです`);
      }

      // ファイル形式チェック
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('対応していないファイル形式です。JPEG、PNG、GIF、WebPのみアップロード可能です');
      }

      // URLパラメータを構築
      const params = new URLSearchParams({
        filename: file.name,
      });

      if (adContentId) {
        params.append('ad_content_id', adContentId.toString());
      }
      if (placeholderName) {
        params.append('placeholder_name', placeholderName);
      }
      if (altText) {
        params.append('alt_text', altText);
      }

      const response = await fetch(
        `/api/upload?${params.toString()}`,
        {
          method: 'POST',
          body: file,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'アップロードに失敗しました');
      }

      const result = await response.json();
      onUpload({
        url: result.url,
        filename: result.filename,
        size: result.size,
        mimeType: result.mimeType,
        imageId: result.imageId,
      });
    } catch (error) {
      // Upload failed - error will be displayed to user
      setError(error instanceof Error ? error.message : 'アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };


  // 画像エラーハンドラ
  const handleImageError = () => {
    setImageError(true);
  };

  // currentImageUrlが変わったときにimageErrorをリセット
  const [prevImageUrl, setPrevImageUrl] = useState(currentImageUrl);
  if (currentImageUrl !== prevImageUrl) {
    setPrevImageUrl(currentImageUrl);
    setImageError(false);
  }

  return (
    <div className={`relative ${className}`}>
      {currentImageUrl && !imageError ? (
        // 画像が選択されている状態
        <div className="relative">
          <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
            <Image
              src={currentImageUrl}
              alt="アップロード済み画像"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={handleImageError}
            />
          </div>
          <div className="mt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={handleClick}
              disabled={disabled || uploading}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
            >
              {uploading ? 'アップロード中...' : '画像を変更'}
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                disabled={disabled || uploading}
                className="text-sm text-red-600 hover:text-red-800 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
              >
                削除
              </button>
            )}
          </div>
        </div>
      ) : (
        // 画像が選択されていない状態
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            w-full h-40 border-2 border-dashed rounded-lg 
            flex flex-col items-center justify-center cursor-pointer
            transition-colors duration-200
            ${disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
            ${uploading ? 'pointer-events-none' : ''}
          `}
        >
          {uploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">アップロード中...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">📁</div>
              <p className="text-sm text-gray-600 mb-1">{placeholder}</p>
              <p className="text-xs text-gray-400">
                最大{maxSizeMB}MB・JPEG、PNG、GIF、WebP
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
}
