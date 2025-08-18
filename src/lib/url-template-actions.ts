'use server';

import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import type {UrlTemplate, CreateUrlTemplateRequest, UpdateUrlTemplateRequest} from './definitions';
import {sql} from '@/lib/db';

const CreateUrlTemplateSchema = z.object({
  name: z.string().min(1, 'テンプレート名は必須です'),
  url: z.string().url('有効なURLを入力してください'),
  parameters: z.record(z.string(), z.string()),
  description: z.string().optional(),
});

const UpdateUrlTemplateSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'テンプレート名は必須です').optional(),
  url: z.string().url('有効なURLを入力してください').optional(),
  parameters: z.record(z.string(), z.string()).optional(),
  description: z.string().optional(),
});

export async function getUrlTemplates(): Promise<UrlTemplate[]> {
  try {
    const result = await sql`
        SELECT id,
               name,
               url,
               parameters,
               description,
               created_at,
               updated_at
        FROM url_templates
        ORDER BY created_at DESC
    `;

    return result.map(row => ({
      ...row,
      parameters: typeof row.parameters === 'string'
        ? JSON.parse(row.parameters)
        : row.parameters || {},
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    })) as UrlTemplate[];
  } catch (error) {
    console.error('Failed to fetch URL templates:', error);
    throw new Error('URLテンプレートの取得に失敗しました');
  }
}

export async function getUrlTemplateById(id: number): Promise<UrlTemplate | null> {
  try {
    const result = await sql`
        SELECT id,
               name,
               url,
               parameters,
               description,
               created_at,
               updated_at
        FROM url_templates
        WHERE id = ${id}
    `;

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      ...row,
      parameters: typeof row.parameters === 'string'
        ? JSON.parse(row.parameters)
        : row.parameters || {},
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    } as UrlTemplate;
  } catch (error) {
    console.error('Failed to fetch URL template:', error);
    throw new Error('URLテンプレートの取得に失敗しました');
  }
}

export async function createUrlTemplate(data: CreateUrlTemplateRequest): Promise<UrlTemplate> {
  try {
    const validatedData = CreateUrlTemplateSchema.parse(data);

    const result = await sql`
        INSERT INTO url_templates (name, url, parameters, description)
        VALUES (${validatedData.name},
                ${validatedData.url},
                ${JSON.stringify(validatedData.parameters)},
                ${validatedData.description || null}) RETURNING 
        id,
        name,
        url,
        parameters,
        description,
        created_at,
        updated_at
    `;

    const row = result[0];
    const newTemplate = {
      ...row,
      parameters: typeof row.parameters === 'string'
        ? JSON.parse(row.parameters)
        : row.parameters || {},
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    } as UrlTemplate;

    revalidatePath('/url-templates');
    return newTemplate;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    console.error('Failed to create URL template:', error);
    throw new Error('URLテンプレートの作成に失敗しました');
  }
}

export async function updateUrlTemplate(data: UpdateUrlTemplateRequest): Promise<UrlTemplate> {
  try {
    const validatedData = UpdateUrlTemplateSchema.parse(data);
    const {id, ...updateFields} = validatedData;

    const result = await sql`
        UPDATE url_templates
        SET name         = COALESCE(${updateFields.name || null}, name),
            url          = COALESCE(${updateFields.url || null}, url),
            parameters   = COALESCE(${updateFields.parameters ? JSON.stringify(updateFields.parameters) : null}, parameters),
            description  = COALESCE(${updateFields.description || null}, description),
            updated_at   = NOW()
        WHERE id = ${id} RETURNING 
        id,
        name,
        url,
        parameters,
        description,
        created_at,
        updated_at
    `;

    if (result.length === 0) {
      throw new Error('URLテンプレートが見つかりません');
    }

    const row = result[0];
    const updatedTemplate = {
      ...row,
      parameters: typeof row.parameters === 'string'
        ? JSON.parse(row.parameters)
        : row.parameters || {},
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    } as UrlTemplate;

    revalidatePath('/url-templates');
    return updatedTemplate;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    console.error('Failed to update URL template:', error);
    throw new Error('URLテンプレートの更新に失敗しました');
  }
}

export async function deleteUrlTemplate(id: number): Promise<void> {
  try {
    const result = await sql`
        DELETE
        FROM url_templates
        WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      throw new Error('URLテンプレートが見つかりません');
    }

    revalidatePath('/url-templates');
  } catch (error) {
    console.error('Failed to delete URL template:', error);
    throw new Error('URLテンプレートの削除に失敗しました');
  }
}