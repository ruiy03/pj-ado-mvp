'use server';

import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import type {AdTemplate, CreateAdTemplateRequest, UpdateAdTemplateRequest} from './definitions';
import {sql} from '@/lib/db';
import {analyzeTemplateChanges, type ConsistencyCheckResult} from './consistency-checker';
import {validateTemplatePlaceholders} from './template-utils/validation';

const CreateAdTemplateSchema = z.object({
  name: z.string().min(1, 'テンプレート名は必須です'),
  html: z.string().min(1, 'HTMLコードは必須です'),
  description: z.string().optional(),
});

const UpdateAdTemplateSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'テンプレート名は必須です').optional(),
  html: z.string().min(1, 'HTMLコードは必須です').optional(),
  description: z.string().optional(),
});

export async function getAdTemplates(): Promise<AdTemplate[]> {
  try {
    const result = await sql`
        SELECT id,
               name,
               html,
               description,
               created_at,
               updated_at
        FROM ad_templates
        ORDER BY created_at DESC
    `;

    return result.map(row => ({
      ...row,
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
      created_at: row.created_at?.toISOString(),
      updated_at: row.updated_at?.toISOString(),
    } as AdTemplate;
  } catch (error) {
    console.error('Failed to fetch ad template:', error);
    throw new Error('広告テンプレートの取得に失敗しました');
  }
}

export async function getAdTemplateByName(name: string): Promise<AdTemplate | null> {
  try {
    const result = await sql`
        SELECT id,
               name,
               html,
               description,
               created_at,
               updated_at
        FROM ad_templates
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
    } as AdTemplate;
  } catch (error) {
    console.error('Failed to fetch ad template by name:', error);
    throw new Error('広告テンプレートの取得に失敗しました');
  }
}

function isTemplateContentEqual(existing: AdTemplate, incoming: CreateAdTemplateRequest): boolean {
  return (
    existing.html === incoming.html &&
    existing.description === (incoming.description || '')
  );
}

export async function createOrUpdateAdTemplate(data: CreateAdTemplateRequest): Promise<{
  template: AdTemplate;
  action: 'created' | 'updated' | 'skipped';
}> {
  try {
    const validatedData = CreateAdTemplateSchema.parse(data);
    
    // プレースホルダーの命名規則を検証
    const placeholderValidation = validateTemplatePlaceholders(validatedData.html);
    if (!placeholderValidation.isValid) {
      throw new Error(placeholderValidation.errors.join('\n'));
    }
    
    // 既存のテンプレートを名前で検索
    const existingTemplate = await getAdTemplateByName(validatedData.name);
    
    if (!existingTemplate) {
      // 存在しない場合は新規作成
      const newTemplate = await createAdTemplate(validatedData);
      return {
        template: newTemplate,
        action: 'created'
      };
    }
    
    // 既存のテンプレートと内容を比較
    if (isTemplateContentEqual(existingTemplate, validatedData)) {
      // 内容が同じ場合はスキップ
      return {
        template: existingTemplate,
        action: 'skipped'
      };
    }
    
    // 内容が異なる場合は更新
    const updatedTemplate = await updateAdTemplate({
      id: existingTemplate.id,
      html: validatedData.html,
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
    console.error('Failed to create or update ad template:', error);
    throw new Error('広告テンプレートの作成または更新に失敗しました');
  }
}

export async function createAdTemplate(data: CreateAdTemplateRequest): Promise<AdTemplate> {
  try {
    const validatedData = CreateAdTemplateSchema.parse(data);

    // プレースホルダーの命名規則を検証
    const placeholderValidation = validateTemplatePlaceholders(validatedData.html);
    if (!placeholderValidation.isValid) {
      throw new Error(placeholderValidation.errors.join('\n'));
    }

    const result = await sql`
        INSERT INTO ad_templates (name, html, description)
        VALUES (${validatedData.name},
                ${validatedData.html},
                ${validatedData.description || null}) RETURNING 
        id,
        name,
        html,
        description,
        created_at,
        updated_at
    `;

    const row = result[0];
    const newTemplate = {
      ...row,
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

/**
 * テンプレート更新前の影響分析を実行
 */
export async function analyzeTemplateUpdateImpact(
  templateId: number,
  newHtml: string,
  newName?: string
): Promise<ConsistencyCheckResult> {
  return await analyzeTemplateChanges(templateId, newHtml, newName);
}

/**
 * 影響分析付きテンプレート更新
 */
export async function updateAdTemplateWithAnalysis(
  data: UpdateAdTemplateRequest
): Promise<{
  template: AdTemplate;
  impact_analysis?: ConsistencyCheckResult;
}> {
  try {
    const validatedData = UpdateAdTemplateSchema.parse(data);
    const {id, ...updateFields} = validatedData;

    let impact_analysis: ConsistencyCheckResult | undefined;

    // HTMLが変更される場合はプレースホルダー検証と影響分析を実行
    if (updateFields.html) {
      // 現在のテンプレート情報を取得してHTML変更チェック
      const currentTemplate = await getAdTemplateById(id);
      if (!currentTemplate) {
        throw new Error('テンプレートが見つかりません');
      }
      
      const htmlChanged = currentTemplate.html !== updateFields.html;
      
      // プレースホルダーの命名規則を検証
      const placeholderValidation = validateTemplatePlaceholders(updateFields.html);
      if (!placeholderValidation.isValid) {
        throw new Error(placeholderValidation.errors.join('\n'));
      }

      // HTMLが実際に変更されている場合のみ影響分析を実行
      if (htmlChanged) {
        try {
          impact_analysis = await analyzeTemplateChanges(
            id,
            updateFields.html,
            updateFields.name
          );
        } catch (analysisError) {
          console.warn('Impact analysis failed:', analysisError);
          // 影響分析が失敗してもテンプレート更新は続行
        }
      }
    }

    // テンプレートを更新
    const template = await updateAdTemplate(validatedData);

    return {
      template,
      impact_analysis,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    console.error('Failed to update template with analysis:', error);
    throw new Error('テンプレートの更新と影響分析に失敗しました');
  }
}

export async function updateAdTemplate(data: UpdateAdTemplateRequest): Promise<AdTemplate> {
  try {
    const validatedData = UpdateAdTemplateSchema.parse(data);
    const {id, ...updateFields} = validatedData;

    // HTMLが更新される場合はプレースホルダーの命名規則を検証
    if (updateFields.html) {
      const placeholderValidation = validateTemplatePlaceholders(updateFields.html);
      if (!placeholderValidation.isValid) {
        throw new Error(placeholderValidation.errors.join('\n'));
      }
    }

    // Use a simple update approach instead of dynamic SQL
    const result = await sql`
        UPDATE ad_templates
        SET name         = COALESCE(${updateFields.name || null}, name),
            html         = COALESCE(${updateFields.html || null}, html),
            description  = COALESCE(${updateFields.description || null}, description),
            updated_at   = NOW()
        WHERE id = ${id} RETURNING 
        id,
        name,
        html,
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
