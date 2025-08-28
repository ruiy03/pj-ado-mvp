'use client';

import ClientProtectedPage from '@/components/ClientProtectedPage';
import UrlTemplateList from './components/UrlTemplateList';
import ImportExportButtons from '@/components/ImportExportButtons';
import {ImportFormSection} from '@/components/ImportExportButtons';
import {useState} from 'react';
import type {ImportResult} from '@/lib/definitions';

export default function UrlTemplates() {
  const [showImportForm, setShowImportForm] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState('');
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [urlParameterFilter, setUrlParameterFilter] = useState('');

  const handleImportClick = () => {
    setShowImportForm(true);
  };

  const handleImportCancel = () => {
    setShowImportForm(false);
    setImportResult(null);
  };

  const handleImportResultClose = () => {
    setImportResult(null);
  };

  const handleCreateClick = () => {
    // この関数は ImportExportButtons の必須プロパティですが、URLテンプレートページでは使用されません
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      setImportLoading(true);
      setError(null);

      const response = await fetch('/api/url-templates/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'インポートに失敗しました');
      }

      setImportResult(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setImportLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      setError(null);
      const response = await fetch('/api/url-templates/export');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'エクスポートに失敗しました');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'url-templates.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エクスポートでエラーが発生しました');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <ClientProtectedPage>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">URLテンプレート管理</h1>
            <ImportExportButtons
              title=""
              itemType="URLテンプレート"
              csvFormat={{
                header: "name,url_template,parameters,description",
                example: '"Google Analytics","https://example.com?utm_source={{source}}","{\"utm_source\":\"website\",\"utm_medium\":\"banner\"}","サンプルURL"',
                description: "parameters列には、JSONオブジェクトを文字列として記載してください"
              }}
              createButtonText="新しいテンプレートを作成"
              createButtonHref="/url-templates/create"
              onImport={handleImportClick}
              onExport={handleExport}
              onCreateClick={handleCreateClick}
              onImportCancel={handleImportCancel}
              onImportResultClose={handleImportResultClose}
              exportLoading={exportLoading}
              showImportForm={showImportForm}
              importLoading={importLoading}
              importResult={importResult}
              handleImport={handleImport}
              showFormsInline={true}
            />
          </div>

          {/* 分離された検索フィールド */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="テンプレート名で検索"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h7"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="説明で検索"
                  value={descriptionFilter}
                  onChange={(e) => setDescriptionFilter(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="URLパラメータで検索"
                  value={urlParameterFilter}
                  onChange={(e) => setUrlParameterFilter(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            {(nameFilter || descriptionFilter || urlParameterFilter) && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">フィルター条件:</span>
                {nameFilter && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    名前: {nameFilter}
                    <button
                      onClick={() => setNameFilter('')}
                      className="ml-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {descriptionFilter && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    説明: {descriptionFilter}
                    <button
                      onClick={() => setDescriptionFilter('')}
                      className="ml-1 text-green-600 hover:text-green-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {urlParameterFilter && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    URLパラメータ: {urlParameterFilter}
                    <button
                      onClick={() => setUrlParameterFilter('')}
                      className="ml-1 text-orange-600 hover:text-orange-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setNameFilter('');
                    setDescriptionFilter('');
                    setUrlParameterFilter('');
                  }}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                >
                  すべてクリア
                </button>
              </div>
            )}
          </div>
        </div>

        {/* インポートフォームをタイトル下に表示 */}
        <ImportFormSection
          itemType="URLテンプレート"
          csvFormat={{
            header: "name,url_template,parameters,description",
            example: '"Google Analytics","https://example.com?utm_source={{source}}","{\"utm_source\":\"website\",\"utm_medium\":\"banner\"}","サンプルURL"',
            description: "parameters列には、JSONオブジェクトを文字列として記載してください"
          }}
          showImportForm={showImportForm}
          importLoading={importLoading}
          importResult={importResult}
          handleImport={handleImport}
          onImportCancel={handleImportCancel}
          onImportResultClose={handleImportResultClose}
        />
        <UrlTemplateList 
          nameFilter={nameFilter}
          descriptionFilter={descriptionFilter}
          urlParameterFilter={urlParameterFilter}
        />
      </div>
    </ClientProtectedPage>
  );
}
