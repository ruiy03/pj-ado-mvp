'use client';

import {useState, useEffect} from 'react';
import {formatDateTimeJST} from '@/lib/date-utils';

interface IntegrityIssue {
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

interface SystemIntegrityStatus {
  overallStatus: 'healthy' | 'warning' | 'critical';
  lastChecked: string;
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  issues: IntegrityIssue[];
}

// キャッシュ管理のための定数とヘルパー関数
const CACHE_KEY = 'integrity_check_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1時間

const getCachedData = (): SystemIntegrityStatus | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const {data, timestamp} = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (_error) {
    // Failed to get cached integrity data - ignore silently
  }
  return null;
};

const setCachedData = (data: SystemIntegrityStatus) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (_error) {
    // Failed to cache integrity data - ignore silently
  }
};

const clearCache = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (_error) {
    // Failed to clear integrity cache - ignore silently
  }
};

export default function IntegrityMonitor() {
  const [integrityStatus, setIntegrityStatus] = useState<SystemIntegrityStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrityStatus = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // キャッシュをクリア（強制更新の場合）
      if (forceRefresh) {
        clearCache();
      }

      const response = await fetch('/api/integrity-check');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '整合性チェックに失敗しました');
      }

      const data = await response.json();
      setIntegrityStatus(data);

      // レスポンスをキャッシュに保存
      setCachedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const loadCachedData = () => {
    const cachedData = getCachedData();
    if (cachedData) {
      setIntegrityStatus(cachedData);
      return true;
    }
    return false;
  };

  useEffect(() => {
    // 初回読み込み時はキャッシュから読み込む
    const hasCachedData = loadCachedData();

    // キャッシュがない場合のみAPI呼び出し
    if (!hasCachedData) {
      fetchIntegrityStatus();
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <div className="w-6 h-6 text-green-500 text-xl flex items-center justify-center">✓</div>;
      case 'warning':
        return <div className="w-6 h-6 text-yellow-500 text-xl flex items-center justify-center">⚠</div>;
      case 'critical':
        return <div className="w-6 h-6 text-red-500 text-xl flex items-center justify-center">✗</div>;
      default:
        return <div className="w-6 h-6 text-gray-500 text-xl flex items-center justify-center">?</div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'critical':
        return 'bg-red-100 border-red-200 text-red-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">重大</span>;
      case 'warning':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">警告</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">不明</span>;
    }
  };

  if (loading && !integrityStatus) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-6 h-6 animate-spin text-xl flex items-center justify-center">↻</div>
            <span>整合性をチェック中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">システム整合性監視</h3>
          <button
            onClick={() => fetchIntegrityStatus(true)}
            disabled={loading}
            className="btn-secondary cursor-pointe"
          >
            <span className={`inline-block mr-2 ${loading ? 'animate-spin' : ''}`}>↻</span>
            再チェック
          </button>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 text-red-500 mx-auto mb-4 text-4xl flex items-center justify-center">✗</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchIntegrityStatus(true)}
            className="btn-danger"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!integrityStatus) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-medium text-gray-900">システム整合性監視</h3>
        </div>
        <button
          onClick={() => fetchIntegrityStatus(true)}
          disabled={loading}
          className="btn-secondary cursor-pointer"
        >
          <span className={`inline-block mr-2 ${loading ? 'animate-spin' : ''}`}>↻</span>
          再チェック
        </button>
      </div>

      {/* システム全体のステータス */}
      <div className={`p-4 rounded-lg border mb-6 ${getStatusColor(integrityStatus.overallStatus)}`}>
        <div className="flex items-center space-x-3">
          {getStatusIcon(integrityStatus.overallStatus)}
          <div>
            <h4 className="font-medium">
              システム全体: {
              integrityStatus.overallStatus === 'healthy' ? '正常' :
                integrityStatus.overallStatus === 'warning' ? '警告あり' : '重大な問題あり'
            }
            </h4>
            <p className="text-sm">
              最終チェック: {formatDateTimeJST(integrityStatus.lastChecked)}
            </p>
          </div>
        </div>
      </div>

      {/* 問題の統計 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{integrityStatus.totalIssues}</div>
          <div className="text-sm text-gray-600">総問題数</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{integrityStatus.criticalIssues}</div>
          <div className="text-sm text-red-600">重大</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{integrityStatus.warningIssues}</div>
          <div className="text-sm text-yellow-600">警告</div>
        </div>
      </div>

      {/* 問題一覧 */}
      {integrityStatus.issues.length > 0 ? (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">検出された問題</h4>
          <div className="space-y-3">
            {integrityStatus.issues.map((issue, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getSeverityBadge(issue.severity)}
                    <h5 className="font-medium text-gray-900">
                      コンテンツ: {issue.contentName}
                    </h5>
                  </div>
                  <span className="text-sm text-gray-500">ID: {issue.contentId}</span>
                </div>

                {issue.templateName && (
                  <div className="text-sm text-gray-600 mb-2">
                    広告テンプレート: {issue.templateName} (ID: {issue.templateId})
                  </div>
                )}

                {issue.urlTemplateName && (
                  <div className="text-sm text-gray-600 mb-2">
                    URLテンプレート: {issue.urlTemplateName} (ID: {issue.urlTemplateId})
                  </div>
                )}

                <p className="text-sm text-gray-700">{issue.description}</p>

                {/* 詳細なプレースホルダー情報 */}
                {(issue.missingPlaceholders && issue.missingPlaceholders.length > 0) && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                    <strong className="text-red-700">不足プレースホルダー:</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {issue.missingPlaceholders.map((placeholder, idx) => (
                        <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                          {placeholder}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(issue.unusedAdTemplatePlaceholders && issue.unusedAdTemplatePlaceholders.length > 0) && (
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                    <strong className="text-orange-700">広告テンプレート未使用:</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {issue.unusedAdTemplatePlaceholders.map((placeholder, idx) => (
                        <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                          {placeholder}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(issue.unusedUrlTemplatePlaceholders && issue.unusedUrlTemplatePlaceholders.length > 0) && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <strong className="text-blue-700">URLテンプレート未定義:</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {issue.unusedUrlTemplatePlaceholders.map((placeholder, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {placeholder}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 mt-1">これらのパラメータがcontent_dataで定義されていません</p>
                  </div>
                )}

                <div className="mt-3 flex space-x-2">
                  <a
                    href={`/ads/${issue.contentId}/edit?returnTo=dashboard`}
                    className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    コンテンツを編集
                  </a>
                  {issue.templateId && (
                    <a
                      href={`/ad-templates/${issue.templateId}/edit?returnTo=dashboard`}
                      className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      広告テンプレートを編集
                    </a>
                  )}
                  {issue.urlTemplateId && (
                    <a
                      href={`/url-templates/${issue.urlTemplateId}/edit?returnTo=dashboard`}
                      className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      URLテンプレートを編集
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 text-green-500 mx-auto mb-4 text-4xl flex items-center justify-center">✓</div>
          <p className="text-gray-600">現在、整合性の問題は検出されていません。</p>
        </div>
      )}
    </div>
  );
}
