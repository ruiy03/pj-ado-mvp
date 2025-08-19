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
      title="広告テンプレート管理"
      itemType="テンプレート"
      csvFormat={{
        header: "name,html,placeholders,description",
        example: '"サンプル広告","<a href={{linkUrl}}><div>{{title}}</div></a>","title,linkUrl","サンプルの説明"',
        description: "placeholders列には、プレースホルダーをカンマで区切って記載してください"
      }}
      {...props}
    />
  );
}
