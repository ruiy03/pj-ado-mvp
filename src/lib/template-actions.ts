'use server';

import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import type {AdTemplate, CreateAdTemplateRequest, UpdateAdTemplateRequest} from './definitions';
import {sql} from '@/lib/db';

const CreateAdTemplateSchema = z.object({
  name: z.string().min(1, 'テンプレート名は必須です'),
  html: z.string().min(1, 'HTMLコードは必須です'),
  placeholders: z.array(z.string()),
  description: z.string().optional(),
});

const UpdateAdTemplateSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'テンプレート名は必須です').optional(),
  html: z.string().min(1, 'HTMLコードは必須です').optional(),
  placeholders: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export async function getAdTemplates(): Promise<AdTemplate[]> {
  try {
    const result = await sql`
        SELECT id,
               name,
               html,
               placeholders,
               description,
               created_at,
               updated_at
        FROM ad_templates
        ORDER BY created_at DESC
    `;

    return result.map(row => ({
      ...row,
      placeholders: typeof row.placeholders === 'string'
        ? JSON.parse(row.placeholders)
        : row.placeholders || [],
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    })) as AdTemplate[];
  } catch (error) {
    console.error('Failed to fetch ad templates:', error);
    throw new Error('広告テンプレートの取得に失敗しました');
  }
}

export async function getAdTemplateById(id: number): Promise<AdTemplate | null> {
  try {
    const result = await sql`
        SELECT id,
               name,
               html,
               placeholders,
               description,
               created_at,
               updated_at
        FROM ad_templates
        WHERE id = ${id}
    `;

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      ...row,
      placeholders: typeof row.placeholders === 'string'
        ? JSON.parse(row.placeholders)
        : row.placeholders || [],
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    } as AdTemplate;
  } catch (error) {
    console.error('Failed to fetch ad template:', error);
    throw new Error('広告テンプレートの取得に失敗しました');
  }
}

export async function createAdTemplate(data: CreateAdTemplateRequest): Promise<AdTemplate> {
  try {
    const validatedData = CreateAdTemplateSchema.parse(data);

    const result = await sql`
        INSERT INTO ad_templates (name, html, placeholders, description)
        VALUES (${validatedData.name},
                ${validatedData.html},
                ${JSON.stringify(validatedData.placeholders)},
                ${validatedData.description || null}) RETURNING 
        id,
        name,
        html,
        placeholders,
        description,
        created_at,
        updated_at
    `;

    const row = result[0];
    const newTemplate = {
      ...row,
      placeholders: typeof row.placeholders === 'string'
        ? JSON.parse(row.placeholders)
        : row.placeholders || [],
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    } as AdTemplate;

    revalidatePath('/ad-templates');
    return newTemplate;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    console.error('Failed to create ad template:', error);
    throw new Error('広告テンプレートの作成に失敗しました');
  }
}

export async function updateAdTemplate(data: UpdateAdTemplateRequest): Promise<AdTemplate> {
  try {
    const validatedData = UpdateAdTemplateSchema.parse(data);
    const {id, ...updateFields} = validatedData;

    // Use a simple update approach instead of dynamic SQL
    const result = await sql`
        UPDATE ad_templates
        SET name         = COALESCE(${updateFields.name || null}, name),
            html         = COALESCE(${updateFields.html || null}, html),
            placeholders = COALESCE(${updateFields.placeholders ? JSON.stringify(updateFields.placeholders) : null}, placeholders),
            description  = COALESCE(${updateFields.description || null}, description),
            updated_at   = NOW()
        WHERE id = ${id} RETURNING 
        id,
        name,
        html,
        placeholders,
        description,
        created_at,
        updated_at
    `;

    if (result.length === 0) {
      throw new Error('広告テンプレートが見つかりません');
    }

    const row = result[0];
    const updatedTemplate = {
      ...row,
      placeholders: typeof row.placeholders === 'string'
        ? JSON.parse(row.placeholders)
        : row.placeholders || [],
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    } as AdTemplate;

    revalidatePath('/ad-templates');
    return updatedTemplate;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    console.error('Failed to update ad template:', error);
    throw new Error('広告テンプレートの更新に失敗しました');
  }
}

export async function deleteAdTemplate(id: number): Promise<void> {
  try {
    const result = await sql`
        DELETE
        FROM ad_templates
        WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      throw new Error('広告テンプレートが見つかりません');
    }

    revalidatePath('/ad-templates');
  } catch (error) {
    console.error('Failed to delete ad template:', error);
    throw new Error('広告テンプレートの削除に失敗しました');
  }
}
