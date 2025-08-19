'use client';

import SharedImportExportButtons from '@/components/ImportExportButtons';
import type {ImportResult} from '@/lib/definitions';

interface ImportExportButtonsProps {
  onImport: () => void;
  onExport: () => void;
  onCreateClick: () => void;
  onImportCancel: () => void;
  onImportResultClose: () => void;
  exportLoading: boolean;
  showImportForm: boolean;
  importLoading: boolean;
  importResult: ImportResult | null;
  handleImport: (e: React.FormEvent) => void;
}

export default function ImportExportButtons(props: ImportExportButtonsProps) {
  return (
    <SharedImportExportButtons
      title="URLテンプレート管理"
      itemType="URLテンプレート"
      csvFormat={{
        header: "name,url_template,parameters,description",
        example: '"Google Analytics","https://example.com?utm_source={{source}}","{\"utm_source\":\"website\",\"utm_medium\":\"banner\"}","サンプルURL"',
        description: "parameters列には、JSONオブジェクトを文字列として記載してください"
      }}
      {...props}
    />
  );
}
