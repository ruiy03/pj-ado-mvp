'use server';

import {revalidatePath} from 'next/cache';
import {auth} from '@/auth';
import {sql} from '@/lib/db';
import {logger} from '@/lib/logger';
import type {SessionUser} from './definitions';

// WordPress API から取得するデータの型定義
export interface WordPressMappingData {
  shortcodes: Array<{
    ad_id: string;
    count: number;
    posts: Array<{
      id: number;
      title: string;
      url: string;
    }>;
  }>;
}

// WordPress 全記事取得APIからのデータの型定義
export interface WordPressAllArticlesData {
  articles: WordPressArticle[];
  total: number;
  page: number;
  per_page: number;
}

export interface WordPressArticle {
  id: string;
  title: string;
  url: string;
  published_at: string;
  category: string;
  has_ad: boolean;
  ad_ids: string[];
}

export interface ArticleAdMapping {
  id: number;
  post_id: number;
  post_title: string;
  post_url: string;
  ad_id: string;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

// WordPress API URL (環境変数から取得)
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || '';

/**
 * WordPress から紐付け情報を取得
 */
export async function fetchWordPressMappings(): Promise<WordPressMappingData | null> {
  try {
    if (!WORDPRESS_API_URL) {
      throw new Error('WordPress API URL が設定されていません');
    }

    const apiUrl = `${WORDPRESS_API_URL}/wp-json/lmg-ad-manager/v1/shortcode-usage`;
    
    logger.info('Fetching WordPress mappings from:', { url: apiUrl });
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // タイムアウト設定 (30秒)
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`WordPress API エラー: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as WordPressMappingData;
    
  } catch (error) {
    logger.error('WordPress mappings 取得エラー:', error);
    return null;
  }
}

/**
 * 取得したWordPressデータをローカルDBに保存
 */
export async function syncWordPressMappings(data: WordPressMappingData): Promise<{
  success: boolean;
  inserted: number;
  updated: number;
  deleted: number;
  errors: string[];
}> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('認証が必要です');
    }

    const user = session.user as SessionUser;
    if (user.role !== 'admin' && user.role !== 'editor') {
      throw new Error('権限がありません');
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;
    const errors: string[] = [];

    // 既存データを取得（後で削除対象を判定）
    const existingMappings = await sql`
      SELECT post_id, ad_id FROM article_ad_mappings
    `;
    const existingKeys = new Set(existingMappings.map(m => `${m.post_id}-${m.ad_id}`));
    const newKeys = new Set<string>();

    // 新しいデータを処理
    for (const shortcode of data.shortcodes) {
      for (const post of shortcode.posts) {
        const key = `${post.id}-${shortcode.ad_id}`;
        newKeys.add(key);

        try {
          const existing = await sql`
            SELECT id FROM article_ad_mappings 
            WHERE post_id = ${post.id} AND ad_id = ${shortcode.ad_id}
          `;

          if (existing.length > 0) {
            // 更新
            await sql`
              UPDATE article_ad_mappings 
              SET post_title = ${post.title}, 
                  post_url = ${post.url}, 
                  synced_at = NOW(), 
                  updated_at = NOW()
              WHERE post_id = ${post.id} AND ad_id = ${shortcode.ad_id}
            `;
            updatedCount++;
          } else {
            // 新規挿入
            await sql`
              INSERT INTO article_ad_mappings (post_id, post_title, post_url, ad_id, synced_at)
              VALUES (${post.id}, ${post.title}, ${post.url}, ${shortcode.ad_id}, NOW())
            `;
            insertedCount++;
          }
        } catch (error) {
          logger.error(`記事 ${post.id} - 広告 ${shortcode.ad_id} の同期エラー:`, error);
          errors.push(`記事ID ${post.id} - 広告ID ${shortcode.ad_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // 削除対象（WordPressに存在しなくなった紐付け）を削除
    for (const existingKey of existingKeys) {
      if (!newKeys.has(existingKey)) {
        const [postId, adId] = existingKey.split('-');
        try {
          await sql`
            DELETE FROM article_ad_mappings 
            WHERE post_id = ${parseInt(postId)} AND ad_id = ${adId}
          `;
          deletedCount++;
        } catch (error) {
          logger.error(`記事 ${postId} - 広告 ${adId} の削除エラー:`, error);
          errors.push(`削除エラー - 記事ID ${postId} - 広告ID ${adId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    logger.info('WordPress同期完了', {
      inserted: insertedCount,
      updated: updatedCount,
      deleted: deletedCount,
      errors: errors.length
    });

    // ページを再検証
    revalidatePath('/article-ad-mapping');

    return {
      success: true,
      inserted: insertedCount,
      updated: updatedCount,
      deleted: deletedCount,
      errors
    };

  } catch (error) {
    logger.error('WordPress同期エラー:', error);
    return {
      success: false,
      inserted: 0,
      updated: 0,
      deleted: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * WordPress同期の実行（fetch + sync）
 */
export async function performWordPressSync(): Promise<{
  success: boolean;
  inserted: number;
  updated: number;
  deleted: number;
  errors: string[];
}> {
  try {
    // WordPress APIから最新データを取得
    const data = await fetchWordPressMappings();
    
    if (!data) {
      return {
        success: false,
        inserted: 0,
        updated: 0,
        deleted: 0,
        errors: ['WordPressからのデータ取得に失敗しました']
      };
    }

    // データをローカルDBに同期
    return await syncWordPressMappings(data);

  } catch (error) {
    logger.error('WordPress同期処理エラー:', error);
    return {
      success: false,
      inserted: 0,
      updated: 0,
      deleted: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * 記事広告紐付け一覧を取得
 */
export async function getArticleAdMappings(): Promise<ArticleAdMapping[]> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('認証が必要です');
    }

    const mappings = await sql`
      SELECT * FROM article_ad_mappings
      ORDER BY synced_at DESC
    `;

    return mappings as ArticleAdMapping[];

  } catch (error) {
    logger.error('記事広告紐付け一覧取得エラー:', error);
    throw error;
  }
}

/**
 * 広告ID別の使用状況を取得
 */
export async function getAdUsageStats(): Promise<Array<{
  ad_id: string;
  ad_name?: string;
  usage_count: number;
  posts: Array<{
    post_id: number;
    post_title: string;
    post_url: string;
  }>;
}>> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('認証が必要です');
    }

    const stats = await sql`
      SELECT 
        aam.ad_id, 
        ac.name as ad_name,
        COUNT(*) as usage_count,
        array_agg(json_build_object(
          'post_id', aam.post_id, 
          'post_title', aam.post_title, 
          'post_url', aam.post_url
        )) as posts
      FROM article_ad_mappings aam
      LEFT JOIN ad_contents ac ON aam.ad_id = ac.id::text
      GROUP BY aam.ad_id, ac.name
      ORDER BY usage_count DESC
    `;

    return stats.map(stat => ({
      ad_id: stat.ad_id,
      ad_name: stat.ad_name || undefined,
      usage_count: Number(stat.usage_count),
      posts: stat.posts || []
    }));

  } catch (error) {
    logger.error('広告使用状況取得エラー:', error);
    throw error;
  }
}

/**
 * 広告ID別の使用統計（簡潔版）を取得
 */
export async function getAdUsageStatsSimple(): Promise<Array<{
  ad_id: string;
  usage_count: number;
  unique_posts: number;
}>> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('認証が必要です');
    }

    const stats = await sql`
      SELECT 
        ad_id, 
        COUNT(*) as usage_count,
        COUNT(DISTINCT post_id) as unique_posts
      FROM article_ad_mappings
      GROUP BY ad_id
      ORDER BY usage_count DESC
    `;

    return stats.map(stat => ({
      ad_id: stat.ad_id,
      usage_count: Number(stat.usage_count),
      unique_posts: Number(stat.unique_posts)
    }));

  } catch (error) {
    logger.error('広告使用統計（簡潔版）取得エラー:', error);
    throw error;
  }
}

/**
 * 最終同期日時を取得
 */
export async function getLastSyncTime(): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    const result = await sql`
      SELECT MAX(synced_at) as last_sync_time 
      FROM article_ad_mappings
    `;

    return result[0]?.last_sync_time || null;

  } catch (error) {
    logger.error('最終同期日時取得エラー:', error);
    return null;
  }
}

/**
 * WordPress から全記事を取得（ページング対応）
 */
export async function fetchAllWordPressArticles(
  page: number = 1,
  perPage: number = 100
): Promise<WordPressAllArticlesData | null> {
  try {
    if (!WORDPRESS_API_URL) {
      throw new Error('WordPress API URL が設定されていません');
    }

    const apiUrl = `${WORDPRESS_API_URL}/wp-json/lmg-ad-manager/v1/all-articles?page=${page}&per_page=${perPage}`;
    
    logger.info('Fetching all WordPress articles from:', { url: apiUrl, page, perPage });
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // タイムアウト設定 (30秒)
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`WordPress API エラー: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as WordPressAllArticlesData;
    
  } catch (error) {
    logger.error('WordPress全記事取得エラー:', error);
    return null;
  }
}

/**
 * WordPress から全記事を取得（全ページ一括取得）
 */
export async function fetchAllWordPressArticlesComplete(): Promise<WordPressArticle[]> {
  try {
    const allArticles: WordPressArticle[] = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      const data = await fetchAllWordPressArticles(page, perPage);
      
      if (!data || data.articles.length === 0) {
        hasMore = false;
        break;
      }

      allArticles.push(...data.articles);
      
      // 次のページがあるかチェック
      hasMore = data.articles.length === perPage && allArticles.length < data.total;
      page++;
    }

    logger.info(`WordPress全記事取得完了: ${allArticles.length}件`);
    return allArticles;
    
  } catch (error) {
    logger.error('WordPress全記事一括取得エラー:', error);
    return [];
  }
}

// カバレッジ統計の型定義
export interface CoverageStats {
  totalArticles: number;
  articlesWithAds: number;
  articlesWithoutAds: number;
  coveragePercentage: number;
  categoryBreakdown: Record<string, {
    total: number;
    withAds: number;
    withoutAds: number;
    percentage: number;
  }>;
}

/**
 * 広告なし記事を取得
 */
export async function getArticlesWithoutAds(): Promise<{
  articles: WordPressArticle[];
  stats: CoverageStats;
}> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('認証が必要です');
    }

    // WordPress から全記事を取得
    const allArticles = await fetchAllWordPressArticlesComplete();
    
    if (allArticles.length === 0) {
      return {
        articles: [],
        stats: {
          totalArticles: 0,
          articlesWithAds: 0,
          articlesWithoutAds: 0,
          coveragePercentage: 0,
          categoryBreakdown: {}
        }
      };
    }

    // 広告なし記事を抽出（WordPress側のhas_adフラグを利用）
    const articlesWithoutAds = allArticles.filter(article => !article.has_ad);

    // カバレッジ統計を計算
    const stats = calculateCoverageStats(allArticles);

    logger.info('広告なし記事取得完了', {
      total: allArticles.length,
      withAds: allArticles.length - articlesWithoutAds.length,
      withoutAds: articlesWithoutAds.length
    });

    return {
      articles: articlesWithoutAds,
      stats
    };

  } catch (error) {
    logger.error('広告なし記事取得エラー:', error);
    throw error;
  }
}

/**
 * カバレッジ統計を計算
 */
function calculateCoverageStats(articles: WordPressArticle[]): CoverageStats {
  const totalArticles = articles.length;
  const articlesWithAds = articles.filter(article => article.has_ad).length;
  const articlesWithoutAds = totalArticles - articlesWithAds;
  const coveragePercentage = totalArticles > 0 ? Math.round((articlesWithAds / totalArticles) * 100) : 0;

  // カテゴリ別の統計を計算
  const categoryBreakdown: Record<string, {
    total: number;
    withAds: number;
    withoutAds: number;
    percentage: number;
  }> = {};

  const categoryGroups = articles.reduce((groups, article) => {
    const category = article.category || '未分類';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(article);
    return groups;
  }, {} as Record<string, WordPressArticle[]>);

  Object.entries(categoryGroups).forEach(([category, categoryArticles]) => {
    const total = categoryArticles.length;
    const withAds = categoryArticles.filter(article => article.has_ad).length;
    const withoutAds = total - withAds;
    const percentage = total > 0 ? Math.round((withAds / total) * 100) : 0;

    categoryBreakdown[category] = {
      total,
      withAds,
      withoutAds,
      percentage
    };
  });

  return {
    totalArticles,
    articlesWithAds,
    articlesWithoutAds,
    coveragePercentage,
    categoryBreakdown
  };
}

/**
 * 広告カバレッジ統計のみを取得
 */
export async function getCoverageStats(): Promise<CoverageStats> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('認証が必要です');
    }

    const allArticles = await fetchAllWordPressArticlesComplete();
    return calculateCoverageStats(allArticles);

  } catch (error) {
    logger.error('カバレッジ統計取得エラー:', error);
    throw error;
  }
}
