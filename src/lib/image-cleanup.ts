'use server';

import {sql} from '@/lib/db';
import {del} from '@vercel/blob';
import {logger} from '@/lib/logger';
import type {AdImage} from './definitions';

export interface CleanupStats {
  totalImages: number;
  deletedImages: number;
  failedDeletions: number;
  deletedSize: number;
  errors: string[];
}

export interface CleanupResult {
  success: boolean;
  stats: CleanupStats;
  message: string;
}

// 孤立画像を検出する
export async function getOrphanedImages(): Promise<AdImage[]> {
  try {
    const result = await sql`
        SELECT ai.id,
               ai.ad_content_id,
               ai.blob_url,
               ai.original_filename,
               ai.file_size,
               ai.mime_type,
               ai.alt_text,
               ai.placeholder_name,
               ai.created_at
        FROM ad_images ai
                 LEFT JOIN ad_contents ac ON ai.ad_content_id = ac.id
        WHERE ac.id IS NULL
        ORDER BY ai.created_at DESC
    `;

    return result.map(row => ({
      ...row,
      created_at: row.created_at?.toISOString(),
    })) as AdImage[];
  } catch (error) {
    console.error('Failed to fetch orphaned images:', error);
    throw new Error('孤立画像の取得に失敗しました');
  }
}

// 古い未使用画像を検出する（draft状態で指定日数以上更新されていない画像）
export async function getOldUnusedImages(daysOld: number = 7): Promise<AdImage[]> {
  try {
    // INTERVAL構文を使わずに日付計算で実装
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await sql`
        SELECT ai.id,
               ai.ad_content_id,
               ai.blob_url,
               ai.original_filename,
               ai.file_size,
               ai.mime_type,
               ai.alt_text,
               ai.placeholder_name,
               ai.created_at
        FROM ad_images ai
                 JOIN ad_contents ac ON ai.ad_content_id = ac.id
        WHERE ai.created_at < ${cutoffDate.toISOString()}
          AND ac.status = 'draft'
          AND ac.updated_at < ${cutoffDate.toISOString()}
        ORDER BY ai.created_at DESC
    `;

    return result.map(row => ({
      ...row,
      created_at: row.created_at?.toISOString(),
    })) as AdImage[];
  } catch (error) {
    console.error('Failed to fetch old unused images:', error);
    throw new Error('古い未使用画像の取得に失敗しました');
  }
}

// 画像リストを削除する（共通処理）
async function deleteImageList(images: AdImage[]): Promise<CleanupStats> {
  const stats: CleanupStats = {
    totalImages: images.length,
    deletedImages: 0,
    failedDeletions: 0,
    deletedSize: 0,
    errors: []
  };

  for (const image of images) {
    try {
      // Vercel Blobから画像ファイルを削除
      await del(image.blob_url);

      // ad_imagesテーブルからレコードを削除
      await sql`
          DELETE
          FROM ad_images
          WHERE id = ${image.id}
      `;

      stats.deletedImages++;
      stats.deletedSize += image.file_size || 0;

      logger.info(`Successfully deleted image: ${image.blob_url}`);
    } catch (error) {
      stats.failedDeletions++;
      const errorMessage = `Failed to delete image ${image.blob_url}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      stats.errors.push(errorMessage);
      console.error(errorMessage);
    }
  }

  return stats;
}

// 全ての未使用画像を一括削除する（自動クリーンアップ用）
export async function cleanupAllUnusedImages(daysOld: number = 7): Promise<CleanupResult> {
  try {
    logger.info('Starting comprehensive image cleanup...');

    const [orphanedImages, oldUnusedImages] = await Promise.all([
      getOrphanedImages(),
      getOldUnusedImages(daysOld)
    ]);

    const allImages = [...orphanedImages, ...oldUnusedImages];

    if (allImages.length === 0) {
      return {
        success: true,
        stats: {
          totalImages: 0,
          deletedImages: 0,
          failedDeletions: 0,
          deletedSize: 0,
          errors: []
        },
        message: '削除対象の未使用画像は見つかりませんでした'
      };
    }

    const stats = await deleteImageList(allImages);

    const message = `包括的画像クリーンアップが完了しました。${stats.deletedImages}/${stats.totalImages}個の画像を削除（${Math.round(stats.deletedSize / 1024 / 1024 * 100) / 100}MB）`;

    logger.info(message);

    return {
      success: stats.failedDeletions === 0,
      stats,
      message
    };
  } catch (error) {
    console.error('Comprehensive image cleanup failed:', error);
    return {
      success: false,
      stats: {
        totalImages: 0,
        deletedImages: 0,
        failedDeletions: 0,
        deletedSize: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      },
      message: '包括的画像クリーンアップに失敗しました'
    };
  }
}
