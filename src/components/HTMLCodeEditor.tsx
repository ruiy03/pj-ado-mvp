'use client';

import {Editor} from '@monaco-editor/react';
import {useRef, useEffect, forwardRef, useImperativeHandle} from 'react';
import * as monaco from 'monaco-editor';

interface HTMLCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  readOnly?: boolean;
  className?: string;
}

export interface HTMLCodeEditorRef {
  formatCode: () => void;
}

const HTMLCodeEditor = forwardRef<HTMLCodeEditorRef, HTMLCodeEditorProps>(({
                                                                             value,
                                                                             onChange,
                                                                             placeholder = '例: <div class="ad-banner"><h2>{{title}}</h2><a href="{{link}}"><img src="{{image}}" /></a></div>',
                                                                             height = 200,
                                                                             readOnly = false,
                                                                             className = ''
                                                                           }, ref) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
    editorRef.current = editor;

    // エディターのテーマとオプションを設定
    monacoInstance.editor.defineTheme('custom-light', {
      base: 'vs',
      inherit: true,
      rules: [
        {token: 'tag', foreground: '0066cc'},
        {token: 'attribute.name', foreground: 'dd0000'},
        {token: 'attribute.value', foreground: '008800'},
        {token: 'string', foreground: '008800'},
        {token: 'comment', foreground: '888888', fontStyle: 'italic'}
      ],
      colors: {
        'editor.foreground': '#000000',
        'editor.background': '#ffffff',
        'editor.selectionBackground': '#b3d4fc',
        'editor.lineHighlightBackground': '#f5f5f5',
        'editorLineNumber.foreground': '#cccccc',
        'editorGutter.background': '#f8f8f8'
      }
    });

    editor.updateOptions({
      fontSize: 14,
      lineHeight: 20,
      minimap: {enabled: false},
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      renderWhitespace: 'boundary',
      lineNumbers: 'on',
      glyphMargin: false,
      folding: true,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 3,
      renderLineHighlight: 'line',
      bracketPairColorization: {enabled: true},
      matchBrackets: 'always',
      formatOnPaste: true,
      formatOnType: true,
      autoIndent: 'full',
      detectIndentation: true,
      guides: {indentation: true}
    });

    // プレースホルダー表示
    if (!value && placeholder) {
      editor.setValue('');
      const decoration = editor.deltaDecorations([], [{
        range: new monacoInstance.Range(1, 1, 1, 1),
        options: {
          after: {
            content: placeholder,
            inlineClassName: 'editor-placeholder'
          }
        }
      }]);

      // 値が入力されたらプレースホルダーを削除
      const disposable = editor.onDidChangeModelContent(() => {
        const currentValue = editor.getValue();
        if (currentValue) {
          editor.deltaDecorations(decoration, []);
          disposable.dispose();
        }
      });
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  useImperativeHandle(ref, () => ({
    formatCode
  }));

  useEffect(() => {
    // プレースホルダー用のCSSスタイルを追加
    const style = document.createElement('style');
    style.textContent = `
      .editor-placeholder::after {
        color: #999 !important;
        font-style: italic;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      className={`border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${className}`}>
      <Editor
        height={height}
        defaultLanguage="html"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="custom-light"
        options={{
          readOnly,
          contextmenu: true,
          selectOnLineNumbers: true,
          cursorBlinking: 'blink'
        }}
        loading={<div className="p-4 text-gray-500 text-center">エディターを読み込み中...</div>}
      />
    </div>
  );
});

HTMLCodeEditor.displayName = 'HTMLCodeEditor';

export default HTMLCodeEditor;
