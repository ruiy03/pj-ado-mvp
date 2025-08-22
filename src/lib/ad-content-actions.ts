'use server';

import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {auth} from '@/auth';
import {sql} from '@/lib/db';
import {del} from '@vercel/blob';
import {logger} from '@/lib/logger';
import type {
  AdContent,
  CreateAdContentRequest,
  UpdateAdContentRequest,
  AdImage,
  CreateAdImageRequest,
  UpdateAdImageRequest,
  AdContentStatus
} from './definitions';

// JSON解析処理を共通化
function parseJsonData(data: unknown): unknown {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      // パース失敗時は空オブジェクトを返す
      return {};
    }
  }
  return data || {};
}

function parseContentData(data: unknown): Record<string, string | number | boolean> {
  return parseJsonData(data) as Record<string, string | number | boolean>;
}

const CreateAdContentSchema = z.object({
  name: z.string().min(1, '広告名は必須です'),
  template_id: z.number({
    message: '広告テンプレートは必須です'
  }),
  url_template_id: z.number({
    message: 'URLテンプレートは必須です'
  }),
  content_data: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  status: z.enum(['draft', 'active', 'paused', 'archived']).default('draft'),
});

const UpdateAdContentSchema = z.object({
  id: z.number(),
  name: z.string().min(1, '広告名は必須です').optional(),
  template_id: z.number().optional(),
  url_template_id: z.number().optional(),
  content_data: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  status: z.enum(['draft', 'active', 'paused', 'archived']).optional(),
});

const CreateAdImageSchema = z.object({
  ad_content_id: z.number(),
  blob_url: z.string().url('有効なURLが必要です'),
  original_filename: z.string().optional(),
  file_size: z.number().optional(),
  mime_type: z.string().optional(),
  alt_text: z.string().optional(),
  placeholder_name: z.string().optional(),
});

export async function getAdContents(): Promise<AdContent[]> {
  try {
    const result = await sql`
        SELECT ac.id,
               ac.name,
               ac.template_id,
               ac.url_template_id,
               ac.content_data,
               ac.status,
               ac.created_by,
               ac.created_at,
               ac.updated_at,
               ac.impressions,
               ac.clicks,
               ac.last_accessed_at,
               -- テンプレート情報
               at.name         as template_name,
               at.html         as template_html,
               -- URLテンプレート情報
               ut.name         as url_template_name,
               ut.url_template as url_template_url,
               -- 作成者情報
               u.name          as created_by_name,
               u.email         as created_by_email
        FROM ad_contents ac
                 LEFT JOIN ad_templates at
        ON ac.template_id = at.id
            LEFT JOIN url_templates ut ON ac.url_template_id = ut.id
            LEFT JOIN users u ON ac.created_by = u.id
        ORDER BY ac.updated_at DESC
    `;

    const contents = result.map(row => ({
      id: row.id,
      name: row.name,
      template_id: row.template_id,
      url_template_id: row.url_template_id,
      content_data: parseContentData(row.content_data),
      status: row.status as AdContentStatus,
      created_by: row.created_by,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      impressions: row.impressions || 0,
      clicks: row.clicks || 0,
      last_accessed_at: row.last_accessed_at?.toISOString(),
      template: row.template_id ? {
        id: row.template_id,
        name: row.template_name,
        html: row.template_html,
      } : undefined,
      url_template: row.url_template_id ? {
        id: row.url_template_id,
        name: row.url_template_name,
        url_template: row.url_template_url,
      } : undefined,
      created_by_user: row.created_by ? {
        id: row.created_by,
        name: row.created_by_name,
        email: row.created_by_email,
      } : undefined,
    })) as AdContent[];

    // 各コンテンツに関連する画像を取得
    for (const content of contents) {
      const images = await getAdImagesByContentId(content.id);
      content.images = images;
    }

    return contents;
  } catch (error) {
    console.error('Failed to fetch ad contents:', error);
    throw new Error('広告コンテンツの取得に失敗しました');
  }
}

export async function getAdContentById(id: number): Promise<AdContent | null> {
  try {
    const result = await sql`
        SELECT ac.id,
               ac.name,
               ac.template_id,
               ac.url_template_id,
               ac.content_data,
               ac.status,
               ac.created_by,
               ac.created_at,
               ac.updated_at,
               ac.impressions,
               ac.clicks,
               ac.last_accessed_at,
               -- テンプレート情報
               at.name         as template_name,
               at.html         as template_html,
               -- URLテンプレート情報
               ut.name         as url_template_name,
               ut.url_template as url_template_url,
               -- 作成者情報
               u.name          as created_by_name,
               u.email         as created_by_email
        FROM ad_contents ac
                 LEFT JOIN ad_templates at
        ON ac.template_id = at.id
            LEFT JOIN url_templates ut ON ac.url_template_id = ut.id
            LEFT JOIN users u ON ac.created_by = u.id
        WHERE ac.id = ${id}
    `;

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    const content = {
      id: row.id,
      name: row.name,
      template_id: row.template_id,
      url_template_id: row.url_template_id,
      content_data: parseContentData(row.content_data),
      status: row.status as AdContentStatus,
      created_by: row.created_by,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      impressions: row.impressions || 0,
      clicks: row.clicks || 0,
      last_accessed_at: row.last_accessed_at?.toISOString(),
      template: row.template_id ? {
        id: row.template_id,
        name: row.template_name,
        html: row.template_html,
      } : undefined,
      url_template: row.url_template_id ? {
        id: row.url_template_id,
        name: row.url_template_name,
        url_template: row.url_template_url,
      } : undefined,
      created_by_user: row.created_by ? {
        id: row.created_by,
        name: row.created_by_name,
        email: row.created_by_email,
      } : undefined,
    } as AdContent;

    // 関連する画像を取得
    content.images = await getAdImagesByContentId(content.id);

    return content;
  } catch (error) {
    console.error('Failed to fetch ad content:', error);
    throw new Error('広告コンテンツの取得に失敗しました');
  }
}

export async function createAdContent(data: CreateAdContentRequest): Promise<AdContent> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('認証が必要です');
    }

    const validatedData = CreateAdContentSchema.parse(data);

    const result = await sql`
        INSERT INTO ad_contents (name,
                                 template_id,
                                 url_template_id,
                                 content_data,
                                 status,
                                 created_by)
        VALUES (${validatedData.name},
                ${validatedData.template_id},
                ${validatedData.url_template_id},
                ${JSON.stringify(validatedData.content_data)},
                ${validatedData.status},
                ${parseInt(session.user.id)}) RETURNING 
        id,
        name,
        template_id,
        url_template_id,
        content_data,
        status,
        created_by,
        created_at,
        updated_at
    `;

    const row = result[0];
    const newContent: AdContent = {
      id: row.id,
      name: row.name,
      template_id: row.template_id,
      url_template_id: row.url_template_id,
      content_data: parseContentData(row.content_data),
      status: row.status,
      created_by: row.created_by,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
      images: [],
    };

    revalidatePath('/ads');
    return newContent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    console.error('Failed to create ad content:', error);
    throw new Error('広告コンテンツの作成に失敗しました');
  }
}

export async function updateAdContent(data: UpdateAdContentRequest): Promise<AdContent> {
  try {
    const validatedData = UpdateAdContentSchema.parse(data);
    const {id, ...updateFields} = validatedData;

    const result = await sql`
        UPDATE ad_contents
        SET name            = COALESCE(${updateFields.name || null}, name),
            template_id     = COALESCE(${updateFields.template_id || null}, template_id),
            url_template_id = COALESCE(${updateFields.url_template_id || null}, url_template_id),
            content_data    = COALESCE(${updateFields.content_data ? JSON.stringify(updateFields.content_data) : null}, content_data),
            status          = COALESCE(${updateFields.status || null}, status),
            updated_at      = NOW()
        WHERE id = ${id} RETURNING 
        id,
        name,
        template_id,
        url_template_id,
        content_data,
        status,
        created_by,
        created_at,
        updated_at
    `;

    if (result.length === 0) {
      throw new Error('広告コンテンツが見つかりません');
    }

    const row = result[0];
    const updatedContent: AdContent = {
      id: row.id,
      name: row.name,
      template_id: row.template_id,
      url_template_id: row.url_template_id,
      content_data: parseContentData(row.content_data),
      status: row.status,
      created_by: row.created_by,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    };

    // 関連する画像を取得
    updatedContent.images = await getAdImagesByContentId(updatedContent.id);

    revalidatePath('/ads');
    return updatedContent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    console.error('Failed to update ad content:', error);
    throw new Error('広告コンテンツの更新に失敗しました');
  }
}

export async function deleteAdContent(id: number): Promise<void> {
  try {
    // 削除前に関連画像を取得
    const relatedImages = await getAdImagesByContentId(id);

    // 広告コンテンツを削除
    const result = await sql`
        DELETE
        FROM ad_contents
        WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      throw new Error('広告コンテンツが見つかりません');
    }

    // 関連画像を削除（Vercel Blobとad_imagesテーブルの両方）
    const imageDeletePromises = relatedImages.map(async (image) => {
      try {
        // Vercel Blobから画像ファイルを削除
        await del(image.blob_url);

        // ad_imagesテーブルからレコードを削除
        await sql`
            DELETE
            FROM ad_images
            WHERE id = ${image.id}
        `;

        logger.info(`Successfully deleted image: ${image.blob_url}`);
      } catch (imageError) {
        console.error(`Failed to delete image ${image.blob_url}:`, imageError);
        // 個別の画像削除失敗は全体の削除を阻止しない
      }
    });

    // 全ての画像削除処理を並行実行
    await Promise.allSettled(imageDeletePromises);

    revalidatePath('/ads');
  } catch (error) {
    console.error('Failed to delete ad content:', error);
    throw new Error('広告コンテンツの削除に失敗しました');
  }
}

// 画像関連の関数
export async function getAdImagesByContentId(contentId: number): Promise<AdImage[]> {
  try {
    const result = await sql`
        SELECT id,
               ad_content_id,
               blob_url,
               original_filename,
               file_size,
               mime_type,
               alt_text,
               placeholder_name,
               created_at
        FROM ad_images
        WHERE ad_content_id = ${contentId}
        ORDER BY created_at DESC
    `;

    return result.map(row => ({
      ...row,
      created_at: row.created_at?.toISOString(),
    })) as AdImage[];
  } catch (error) {
    console.error('Failed to fetch ad images:', error);
    return [];
  }
}

export async function createAdImage(data: CreateAdImageRequest): Promise<AdImage> {
  try {
    const validatedData = CreateAdImageSchema.parse(data);

    const result = await sql`
        INSERT INTO ad_images (ad_content_id,
                               blob_url,
                               original_filename,
                               file_size,
                               mime_type,
                               alt_text,
                               placeholder_name)
        VALUES (${validatedData.ad_content_id},
                ${validatedData.blob_url},
                ${validatedData.original_filename || null},
                ${validatedData.file_size || null},
                ${validatedData.mime_type || null},
                ${validatedData.alt_text || null},
                ${validatedData.placeholder_name || null}) RETURNING 
        id,
        ad_content_id,
        blob_url,
        original_filename,
        file_size,
        mime_type,
        alt_text,
        placeholder_name,
        created_at
    `;

    const row = result[0];
    const newImage = {
      ...row,
      created_at: row.created_at?.toISOString(),
    } as AdImage;

    revalidatePath('/ads');
    return newImage;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    console.error('Failed to create ad image:', error);
    throw new Error('画像の登録に失敗しました');
  }
}

export async function updateAdImage(data: UpdateAdImageRequest): Promise<AdImage> {
  try {
    const {id, ...updateFields} = data;

    const result = await sql`
        UPDATE ad_images
        SET alt_text         = COALESCE(${updateFields.alt_text || null}, alt_text),
            placeholder_name = COALESCE(${updateFields.placeholder_name || null}, placeholder_name)
        WHERE id = ${id} RETURNING 
        id,
        ad_content_id,
        blob_url,
        original_filename,
        file_size,
        mime_type,
        alt_text,
        placeholder_name,
        created_at
    `;

    if (result.length === 0) {
      throw new Error('画像が見つかりません');
    }

    const row = result[0];
    const updatedImage = {
      ...row,
      created_at: row.created_at?.toISOString(),
    } as AdImage;

    revalidatePath('/ads');
    return updatedImage;
  } catch (error) {
    console.error('Failed to update ad image:', error);
    throw new Error('画像の更新に失敗しました');
  }
}

export async function deleteAdImage(id: number): Promise<void> {
  try {
    const result = await sql`
        DELETE
        FROM ad_images
        WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      throw new Error('画像が見つかりません');
    }

    revalidatePath('/ads');
  } catch (error) {
    console.error('Failed to delete ad image:', error);
    throw new Error('画像の削除に失敗しました');
  }
}

// アップロード済み画像をadContentに関連付ける
export async function associateImagesWithAdContent(
  adContentId: number,
  imageUrls: Record<string, string>
): Promise<void> {
  try {
    for (const [placeholderName, imageUrl] of Object.entries(imageUrls)) {
      // 既に同じプレースホルダー名で関連付けられている画像があるかチェック
      const existingImage = await sql`
          SELECT id
          FROM ad_images
          WHERE ad_content_id = ${adContentId}
            AND placeholder_name = ${placeholderName}
      `;

      if (existingImage.length === 0) {
        // 新しい画像として登録
        await sql`
            INSERT INTO ad_images (ad_content_id,
                                   blob_url,
                                   placeholder_name)
            VALUES (${adContentId},
                    ${imageUrl},
                    ${placeholderName})
        `;
      } else {
        // 既存の画像を更新
        await sql`
            UPDATE ad_images
            SET blob_url = ${imageUrl}
            WHERE id = ${existingImage[0].id}
        `;
      }
    }

    revalidatePath('/ads');
  } catch (error) {
    console.error('Failed to associate images with ad content:', error);
    throw new Error('画像の関連付けに失敗しました');
  }
}

// インプレッション数を増加
export async function trackImpression(id: number): Promise<void> {
  try {
    const result = await sql`
        UPDATE ad_contents
        SET impressions = COALESCE(impressions, 0) + 1,
            last_accessed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${id} AND status = 'active'
        RETURNING impressions, status
    `;
    
    if (result.length === 0) {
      console.warn(`Impression not tracked for content ${id}: content not found or not active`);
    }
  } catch (error) {
    console.error(`Failed to track impression for content ${id}:`, error);
    // エラーでも配信は継続する
  }
}

// クリック数を増加
export async function trackClick(id: number): Promise<void> {
  try {
    await sql`
        UPDATE ad_contents
        SET clicks = COALESCE(clicks, 0) + 1,
            last_accessed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${id} AND status = 'active'
    `;
  } catch (error) {
    console.error('Failed to track click:', error);
    // エラーでもリダイレクトは継続する
  }
}
