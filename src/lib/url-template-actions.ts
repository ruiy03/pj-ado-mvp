'use server';

import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import type {UrlTemplate, CreateUrlTemplateRequest, UpdateUrlTemplateRequest} from './definitions';
import {sql} from '@/lib/db';

const CreateUrlTemplateSchema = z.object({
  name: z.string().min(1, 'テンプレート名は必須です'),
  url_template: z.string().min(1, 'URLテンプレートは必須です'),
  description: z.string().optional(),
});

const UpdateUrlTemplateSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'テンプレート名は必須です').optional(),
  url_template: z.string().min(1, 'URLテンプレートは必須です').optional(),
  description: z.string().optional(),
});

export async function getUrlTemplates(): Promise<UrlTemplate[]> {
  try {
    const result = await sql`
        SELECT id,
               name,
               url_template,
               description,
               created_at,
               updated_at
        FROM url_templates
        ORDER BY created_at DESC
    `;

    return result.map(row => ({
      ...row,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    })) as UrlTemplate[];
  } catch (_error) {
    // Failed to fetch URL templates - error will be thrown
    throw new Error('URLテンプレートの取得に失敗しました');
  }
}

export async function getUrlTemplateById(id: number): Promise<UrlTemplate | null> {
  try {
    const result = await sql`
        SELECT id,
               name,
               url_template,
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
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    } as UrlTemplate;
  } catch (_error) {
    // Failed to fetch URL template - error will be thrown
    throw new Error('URLテンプレートの取得に失敗しました');
  }
}

export async function getUrlTemplateByName(name: string): Promise<UrlTemplate | null> {
  try {
    const result = await sql`
        SELECT id,
               name,
               url_template,
               description,
               created_at,
               updated_at
        FROM url_templates
        WHERE name = ${name}
    `;

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      ...row,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    } as UrlTemplate;
  } catch (_error) {
    // Failed to fetch URL template by name - error will be thrown
    throw new Error('URLテンプレートの取得に失敗しました');
  }
}

function isUrlTemplateContentEqual(existing: UrlTemplate, incoming: CreateUrlTemplateRequest): boolean {
  return (
    existing.url_template === incoming.url_template &&
    existing.description === (incoming.description || '')
  );
}

export async function createOrUpdateUrlTemplate(data: CreateUrlTemplateRequest): Promise<{
  template: UrlTemplate;
  action: 'created' | 'updated' | 'skipped';
}> {
  try {
    const validatedData = CreateUrlTemplateSchema.parse(data);
    
    // 既存のテンプレートを名前で検索
    const existingTemplate = await getUrlTemplateByName(validatedData.name);
    
    if (!existingTemplate) {
      // 存在しない場合は新規作成
      const newTemplate = await createUrlTemplate(validatedData);
      return {
        template: newTemplate,
        action: 'created'
      };
    }
    
    // 既存のテンプレートと内容を比較
    if (isUrlTemplateContentEqual(existingTemplate, validatedData)) {
      // 内容が同じ場合はスキップ
      return {
        template: existingTemplate,
        action: 'skipped'
      };
    }
    
    // 内容が異なる場合は更新
    const updatedTemplate = await updateUrlTemplate({
      id: existingTemplate.id,
      url_template: validatedData.url_template,
      description: validatedData.description
    });
    
    return {
      template: updatedTemplate,
      action: 'updated'
    };
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    // Failed to create or update URL template - error will be thrown
    throw new Error('URLテンプレートの作成または更新に失敗しました');
  }
}

export async function createUrlTemplate(data: CreateUrlTemplateRequest): Promise<UrlTemplate> {
  try {
    const validatedData = CreateUrlTemplateSchema.parse(data);

    const result = await sql`
        INSERT INTO url_templates (name, url_template, description)
        VALUES (${validatedData.name},
                ${validatedData.url_template},
                ${validatedData.description || null}) RETURNING 
        id,
        name,
        url_template,
        description,
        created_at,
        updated_at
    `;

    const row = result[0];
    const newTemplate = {
      ...row,
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    } as UrlTemplate;

    revalidatePath('/url-templates');
    return newTemplate;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    // Failed to create URL template - error will be thrown
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
            url_template = COALESCE(${updateFields.url_template || null}, url_template),
            description  = COALESCE(${updateFields.description || null}, description),
            updated_at   = NOW()
        WHERE id = ${id} RETURNING 
        id,
        name,
        url_template,
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
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    } as UrlTemplate;

    revalidatePath('/url-templates');
    return updatedTemplate;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    // Failed to update URL template - error will be thrown
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
  } catch (_error) {
    // Failed to delete URL template - error will be thrown
    throw new Error('URLテンプレートの削除に失敗しました');
  }
}
