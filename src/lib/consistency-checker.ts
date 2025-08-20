'use server';

import {sql} from '@/lib/db';
import {extractPlaceholders} from '@/lib/template-utils';

export interface PlaceholderDiff {
  added: string[];      // 新しく追加されたプレースホルダー
  removed: string[];    // 削除されたプレースホルダー
  unchanged: string[];  // 変更されていないプレースホルダー
}

export interface AffectedAdContent {
  id: number;
  name: string;
  status: string;
  missing_placeholders: string[];    // 新しいテンプレートに存在しないプレースホルダー
  unused_placeholders: string[];     // content_dataに存在するが新テンプレートにないプレースホルダー
  created_at?: string;
}

export interface ConsistencyCheckResult {
  template_id: number;
  template_name: string;
  placeholder_diff: PlaceholderDiff;
  affected_contents: AffectedAdContent[];
  total_affected: number;
  severity: 'low' | 'medium' | 'high';
}

export interface UrlTemplateConsistencyCheckResult {
  template_id: number;
  template_name: string;
  url_template_diff: {
    changed: boolean;
    old_parameters: string[];
    new_parameters: string[];
  };
  affected_contents: AffectedAdContent[];
  total_affected: number;
  severity: 'low' | 'medium' | 'high';
}

/**
 * プレースホルダーの差分を検出
 */
export async function detectPlaceholderDiff(
  oldPlaceholders: string[],
  newHtml: string
): Promise<PlaceholderDiff> {
  const newPlaceholders = extractPlaceholders(newHtml);

  const oldSet = new Set(oldPlaceholders);
  const newSet = new Set(newPlaceholders);

  const added = newPlaceholders.filter(p => !oldSet.has(p));
  const removed = oldPlaceholders.filter(p => !newSet.has(p));
  const unchanged = oldPlaceholders.filter(p => newSet.has(p));

  return {added, removed, unchanged};
}

/**
 * テンプレート変更の影響を受ける広告コンテンツを特定
 */
export async function findAffectedAdContents(
  templateId: number,
  newHtml: string
): Promise<AffectedAdContent[]> {
  try {
    // 対象テンプレートを使用している広告コンテンツとURLテンプレートを取得
    const result = await sql`
        SELECT ac.id,
               ac.name,
               ac.status,
               ac.content_data,
               ac.created_at,
               ut.url_template
        FROM ad_contents ac
                 LEFT JOIN url_templates ut ON ac.url_template_id = ut.id
        WHERE ac.template_id = ${templateId}
        ORDER BY ac.updated_at DESC
    `;

    if (result.length === 0) {
      return [];
    }

    // 新しいHTMLからプレースホルダーを抽出
    const newPlaceholders = extractPlaceholders(newHtml);

    const affectedContents: AffectedAdContent[] = [];

    for (const row of result) {
      const contentData = typeof row.content_data === 'string'
        ? JSON.parse(row.content_data)
        : (row.content_data || {});

      const contentPlaceholders = Object.keys(contentData);

      // 必要なプレースホルダーを計算（HTMLテンプレート + URLテンプレート）
      const requiredPlaceholders = new Set(newPlaceholders);

      // URLテンプレートのプレースホルダーも追加
      if (row.url_template) {
        const urlPlaceholders = extractPlaceholders(row.url_template);
        urlPlaceholders.forEach(p => requiredPlaceholders.add(p));
      }

      // HTMLテンプレートのプレースホルダーのみに関する不整合をチェック
      const htmlMissingPlaceholders = newPlaceholders.filter(p => !(p in contentData));
      const htmlUnusedPlaceholders = contentPlaceholders.filter(p => {
        // URLテンプレートで使用されている場合は「未使用」とみなさない
        if (row.url_template) {
          const urlPlaceholders = extractPlaceholders(row.url_template);
          if (urlPlaceholders.includes(p)) {
            return false;
          }
        }
        return !newPlaceholders.includes(p);
      });

      // HTMLテンプレートに関する不整合がある場合のみ追加
      if (htmlMissingPlaceholders.length > 0 || htmlUnusedPlaceholders.length > 0) {
        affectedContents.push({
          id: row.id,
          name: row.name,
          status: row.status,
          missing_placeholders: htmlMissingPlaceholders,
          unused_placeholders: htmlUnusedPlaceholders,
          created_at: row.created_at?.toISOString(),
        });
      }
    }

    return affectedContents;
  } catch (error) {
    console.error('Failed to find affected ad contents:', error);
    throw new Error('影響を受ける広告コンテンツの検索に失敗しました');
  }
}

/**
 * テンプレート変更の影響を分析
 */
export async function analyzeTemplateChanges(
  templateId: number,
  newHtml: string,
  newName?: string
): Promise<ConsistencyCheckResult> {
  try {
    // 現在のテンプレート情報を取得
    const templateResult = await sql`
        SELECT id, name, html
        FROM ad_templates
        WHERE id = ${templateId}
    `;

    if (templateResult.length === 0) {
      throw new Error('テンプレートが見つかりません');
    }

    const currentTemplate = templateResult[0];

    // HTMLが変更されているかチェック
    const htmlChanged = currentTemplate.html !== newHtml;

    // HTMLに変更がない（名前・説明のみの変更）場合は影響分析をスキップ
    if (!htmlChanged) {
      return {
        template_id: templateId,
        template_name: newName || currentTemplate.name,
        placeholder_diff: {added: [], removed: [], unchanged: []},
        affected_contents: [],
        total_affected: 0,
        severity: 'low',
      };
    }

    // 現在のHTMLからプレースホルダーを動的に抽出
    const currentPlaceholders = extractPlaceholders(currentTemplate.html);

    // プレースホルダーの差分を検出
    const placeholder_diff = await detectPlaceholderDiff(currentPlaceholders, newHtml);

    // 影響を受ける広告コンテンツを特定
    let affected_contents = await findAffectedAdContents(templateId, newHtml);

    // HTMLが変更されている場合、そのテンプレートを使用する全ての広告コンテンツが影響を受ける
    if (htmlChanged && affected_contents.length === 0) {
      // プレースホルダーに問題がなくてもHTMLが変更されていれば、全ての広告コンテンツを取得
      const allContentsResult = await sql`
          SELECT ac.id, ac.name, ac.status, ac.content_data, ac.created_at
          FROM ad_contents ac
          WHERE ac.template_id = ${templateId}
          ORDER BY ac.updated_at DESC
      `;

      affected_contents = allContentsResult.map(row => ({
        id: row.id,
        name: row.name,
        status: row.status,
        missing_placeholders: [],
        unused_placeholders: [],
        created_at: row.created_at?.toISOString(),
      }));
    }

    // 重要度を判定
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (affected_contents.length >= 5) {
      severity = 'high';
    } else if (placeholder_diff.removed.length > 0 || placeholder_diff.added.length > 0) {
      severity = 'medium';
    }
    // HTMLやタイトル変更のみの場合はlowのまま

    return {
      template_id: templateId,
      template_name: newName || currentTemplate.name,
      placeholder_diff,
      affected_contents,
      total_affected: affected_contents.length,
      severity,
    };
  } catch (error) {
    console.error('Failed to analyze template changes:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      templateId,
      newHtml: newHtml?.substring(0, 100) + '...'
    });
    throw new Error(`テンプレート変更の影響分析に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * URLテンプレート変更の影響を分析
 */
export async function analyzeUrlTemplateChanges(
  templateId: number,
  newUrlTemplate: string,
  newName?: string
): Promise<UrlTemplateConsistencyCheckResult> {
  try {
    // 現在のURLテンプレート情報を取得
    const templateResult = await sql`
        SELECT id, name, url_template
        FROM url_templates
        WHERE id = ${templateId}
    `;

    if (templateResult.length === 0) {
      throw new Error('URLテンプレートが見つかりません');
    }

    const currentTemplate = templateResult[0];

    // URLテンプレートが変更されているかチェック
    const urlTemplateChanged = currentTemplate.url_template !== newUrlTemplate;

    // URLテンプレートに変更がない（名前・説明のみの変更）場合は影響分析をスキップ
    if (!urlTemplateChanged) {
      return {
        template_id: templateId,
        template_name: newName || currentTemplate.name,
        url_template_diff: {
          changed: false,
          old_parameters: [],
          new_parameters: [],
        },
        affected_contents: [],
        total_affected: 0,
        severity: 'low',
      };
    }

    // URLテンプレートからプレースホルダーを抽出
    const oldParameters = extractPlaceholders(currentTemplate.url_template);
    const newParameters = extractPlaceholders(newUrlTemplate);

    // パラメータの変更を分析
    const parametersAdded = newParameters.filter(p => !oldParameters.includes(p));
    const parametersRemoved = oldParameters.filter(p => !newParameters.includes(p));

    // 影響を受ける広告コンテンツを特定
    const affectedContentsResult = await sql`
        SELECT ac.id, ac.name, ac.status, ac.content_data, ac.created_at
        FROM ad_contents ac
        WHERE ac.url_template_id = ${templateId}
        ORDER BY ac.updated_at DESC
    `;

    const affected_contents = affectedContentsResult.map(row => {
      const contentData = typeof row.content_data === 'string'
        ? JSON.parse(row.content_data)
        : (row.content_data || {});

      // URLテンプレートのパラメータのみを対象にする
      // content_dataからURLテンプレート関連のパラメータのみを抽出
      const urlParameters = Object.keys(contentData).filter(key =>
        oldParameters.includes(key) || newParameters.includes(key)
      );

      // URLテンプレートのパラメータ変更による影響を分析
      // 削除されたパラメータのみを「不要」とし、追加されたパラメータは問題にしない
      // （URLパラメータは通常、動的に設定されるため）
      const missing_placeholders: string[] = []; // URLパラメータの追加は問題にしない
      const unused_placeholders = urlParameters.filter(p => parametersRemoved.includes(p));

      return {
        id: row.id,
        name: row.name,
        status: row.status,
        missing_placeholders,
        unused_placeholders,
        created_at: row.created_at?.toISOString(),
      };
    });

    // 重要度を判定
    let severity: 'low' | 'medium' | 'high' = 'low';

    // 全URLテンプレートを使用している広告コンテンツ数を取得
    const totalUsingContents = affectedContentsResult.length;

    if (totalUsingContents > 5) {
      // 高: 影響を受ける広告コンテンツが5件超
      severity = 'high';
    } else if (parametersAdded.length > 0 || parametersRemoved.length > 0) {
      // 中: URLパラメータの追加または削除（手動修正必要）
      severity = 'medium';
    }
    // 低: 名前・説明変更など軽微な変更のみ（デフォルト）

    return {
      template_id: templateId,
      template_name: newName || currentTemplate.name,
      url_template_diff: {
        changed: urlTemplateChanged,
        old_parameters: oldParameters,
        new_parameters: newParameters,
      },
      affected_contents,
      total_affected: totalUsingContents,
      severity,
    };
  } catch (error) {
    console.error('Failed to analyze URL template changes:', error);
    throw new Error('URLテンプレート変更の影響分析に失敗しました');
  }
}

/**
 * 特定の広告コンテンツの整合性を検証
 */
export async function validateContentIntegrity(contentId: number): Promise<{
  is_valid: boolean;
  missing_placeholders: string[];
  unused_placeholders: string[];
  template_name: string;
}> {
  try {
    const result = await sql`
        SELECT ac.content_data,
               at.name as template_name,
               at.html as template_html
        FROM ad_contents ac
                 LEFT JOIN ad_templates at
        ON ac.template_id = at.id
        WHERE ac.id = ${contentId}
    `;

    if (result.length === 0) {
      throw new Error('広告コンテンツが見つかりません');
    }

    const row = result[0];
    const contentData = typeof row.content_data === 'string'
      ? JSON.parse(row.content_data)
      : (row.content_data || {});

    // テンプレートから現在のプレースホルダーを抽出
    const templatePlaceholders = extractPlaceholders(row.template_html);
    const templatePlaceholderSet = new Set(templatePlaceholders);

    const contentPlaceholders = Object.keys(contentData);

    // 不足・未使用プレースホルダーを検出
    const missing_placeholders = templatePlaceholders.filter(p => !(p in contentData));
    const unused_placeholders = contentPlaceholders.filter(p => !templatePlaceholderSet.has(p));

    return {
      is_valid: missing_placeholders.length === 0 && unused_placeholders.length === 0,
      missing_placeholders,
      unused_placeholders,
      template_name: row.template_name,
    };
  } catch (error) {
    console.error('Failed to validate content integrity:', error);
    throw new Error('広告コンテンツの整合性検証に失敗しました');
  }
}

export interface IntegrityIssue {
  type: 'placeholder_mismatch' | 'missing_template' | 'orphaned_content';
  contentId: number;
  contentName: string;
  templateId?: number;
  templateName?: string;
  urlTemplateId?: number;
  urlTemplateName?: string;
  description: string;
  missingPlaceholders?: string[];
  unusedAdTemplatePlaceholders?: string[];
  unusedUrlTemplatePlaceholders?: string[];
  severity: 'critical' | 'warning';
}

export interface SystemIntegrityStatus {
  overallStatus: 'healthy' | 'warning' | 'critical';
  lastChecked: string;
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
  issues: IntegrityIssue[];
}

/**
 * 全体的な整合性状況を取得
 */
export async function getSystemIntegrityStatus(): Promise<SystemIntegrityStatus> {
  try {
    const issues: IntegrityIssue[] = [];

    // 問題のあるコンテンツを検出
    const contentResult = await sql`
        SELECT ac.id,
               ac.name as content_name,
               ac.content_data,
               ac.template_id,
               ac.url_template_id,
               at.name as template_name,
               at.html as template_html,
               ut.name as url_template_name,
               ut.url_template
        FROM ad_contents ac
                 LEFT JOIN ad_templates at
        ON ac.template_id = at.id
            LEFT JOIN url_templates ut ON ac.url_template_id = ut.id
        WHERE at.html IS NOT NULL
    `;

    for (const row of contentResult) {
      const contentData = typeof row.content_data === 'string'
        ? JSON.parse(row.content_data)
        : (row.content_data || {});

      const templatePlaceholders = extractPlaceholders(row.template_html);
      const contentPlaceholders = Object.keys(contentData);

      // HTMLテンプレートに関する不整合をチェック
      const missing = templatePlaceholders.filter(p => !(p in contentData));

      // URLテンプレートのプレースホルダーを抽出
      const urlPlaceholders = row.url_template ? extractPlaceholders(row.url_template) : [];

      // 未使用プレースホルダーを分類
      const unusedAdTemplate: string[] = [];
      const unusedUrlTemplate: string[] = [];

      // 標準的なUTMパラメータとその他のURL関連パラメータ
      const standardUrlParams = new Set([
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'baseUrl', 'source', 'medium', 'campaign', 'term', 'content'
      ]);

      // パラメータマッピング: 広告テンプレートのパラメータがURLテンプレートで別名で使用される場合
      const parameterMappings = new Map([
        ['link', 'baseUrl'],  // linkパラメータはbaseUrlとして使用される
        ['url', 'baseUrl'],   // urlパラメータもbaseUrlとして使用される可能性
      ]);

      // content_dataに存在するが、どちらのテンプレートでも使用されていないプレースホルダー
      contentPlaceholders.forEach(p => {
        let isUsed = false;

        // 広告テンプレートで直接使用されているか
        if (templatePlaceholders.includes(p)) {
          isUsed = true;
        }

        // URLテンプレートで直接使用されているか
        if (urlPlaceholders.includes(p)) {
          isUsed = true;
        }

        // パラメータマッピングを通して使用されているかチェック
        if (!isUsed) {
          const mappedName = parameterMappings.get(p);
          if (mappedName && urlPlaceholders.includes(mappedName)) {
            isUsed = true; // linkパラメータがbaseUrlとしてURLテンプレートで使用されている
          }

          // 逆マッピングもチェック（baseUrlパラメータがlinkとして広告テンプレートで使用されている）
          for (const [adParam, urlParam] of parameterMappings) {
            if (p === urlParam && templatePlaceholders.includes(adParam)) {
              isUsed = true;
              break;
            }
          }
        }

        // 標準的なURLパラメータの場合は未使用とみなさない
        if (!isUsed && !standardUrlParams.has(p)) {
          // どちらのテンプレートにも存在せず、マッピングもなく、標準URLパラメータでもない
          unusedAdTemplate.push(p);
        }
      });

      // URLテンプレートで必要だがcontent_dataに存在しないプレースホルダー
      urlPlaceholders.forEach(p => {
        let hasValue = false;

        // 直接存在するか
        if (p in contentData) {
          hasValue = true;
        }

        // パラメータマッピングを通して存在するか
        if (!hasValue) {
          // 逆マッピングをチェック（baseUrlが必要だがlinkパラメータで提供されている）
          for (const [adParam, urlParam] of parameterMappings) {
            if (p === urlParam && adParam in contentData) {
              hasValue = true;
              break;
            }
          }
        }

        if (!hasValue) {
          unusedUrlTemplate.push(p);
        }
      });

      if (missing.length > 0 || unusedAdTemplate.length > 0 || unusedUrlTemplate.length > 0) {
        let description = '';

        if (missing.length > 0) {
          description += `不足プレースホルダー: ${missing.join(', ')}`;
        }

        if (unusedAdTemplate.length > 0) {
          if (description) description += ' / ';
          description += `広告テンプレート未使用: ${unusedAdTemplate.join(', ')}`;
        }

        if (unusedUrlTemplate.length > 0) {
          if (description) description += ' / ';
          description += `URLテンプレート未定義: ${unusedUrlTemplate.join(', ')}`;
        }


        issues.push({
          type: 'placeholder_mismatch',
          contentId: row.id,
          contentName: row.content_name,
          templateId: row.template_id,
          templateName: row.template_name,
          urlTemplateId: row.url_template_id,
          urlTemplateName: row.url_template_name,
          description,
          missingPlaceholders: missing,
          unusedAdTemplatePlaceholders: unusedAdTemplate,
          unusedUrlTemplatePlaceholders: unusedUrlTemplate,
          severity: 'warning',
        });
      }
    }

    // 孤立したコンテンツ（テンプレートが削除されたもの）を検出
    const orphanedResult = await sql`
        SELECT ac.id, ac.name as content_name
        FROM ad_contents ac
                 LEFT JOIN ad_templates at
        ON ac.template_id = at.id
        WHERE at.id IS NULL
    `;

    for (const row of orphanedResult) {
      issues.push({
        type: 'orphaned_content',
        contentId: row.id,
        contentName: row.content_name,
        description: '参照されているテンプレートが削除されています',
        severity: 'critical',
      });
    }

    // 統計計算
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const warningIssues = issues.filter(i => i.severity === 'warning').length;
    const infoIssues = 0; // IntegrityIssueのseverityは'critical'|'warning'のみ
    const totalIssues = issues.length;

    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalIssues > 0) {
      overallStatus = 'critical';
    } else if (warningIssues > 0) {
      overallStatus = 'warning';
    }

    return {
      overallStatus,
      lastChecked: new Date().toISOString(),
      totalIssues,
      criticalIssues,
      warningIssues,
      infoIssues,
      issues,
    };
  } catch (error) {
    console.error('Failed to get system integrity status:', error);
    throw new Error('システム整合性状況の取得に失敗しました');
  }
}
