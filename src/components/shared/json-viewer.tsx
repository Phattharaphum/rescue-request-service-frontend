// src\components\shared\json-viewer.tsx
'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CopyButton } from '@/components/shared/copy-button';
import { cn } from '@/lib/utils/cn';

interface JsonViewerProps {
  data: unknown;
  collapsed?: boolean;
  maxHeight?: string;
  className?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function colorizeJson(json: string): string {
  return escapeHtml(json).replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          return `<span class="text-gray-500 font-medium">${match}</span>`;
        }
        return `<span class="text-green-700">${match}</span>`;
      }
      if (/true|false/.test(match)) {
        return `<span class="text-amber-600">${match}</span>`;
      }
      if (/null/.test(match)) {
        return `<span class="text-red-500">${match}</span>`;
      }
      return `<span class="text-blue-600">${match}</span>`;
    },
  );
}

export function JsonViewer({ data, collapsed = false, maxHeight = '320px', className }: JsonViewerProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const json = JSON.stringify(data, null, 2);
  const highlighted = colorizeJson(json);

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-gray-50 overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-100">
        <button
          onClick={() => setIsCollapsed((v) => !v)}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
        >
          {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          {isCollapsed ? 'แสดง JSON' : 'ย่อ JSON'}
        </button>
        <CopyButton text={json} />
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="overflow-auto" style={{ maxHeight }}>
          <pre
            className="p-4 text-xs leading-relaxed font-mono text-gray-800 whitespace-pre"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>
      )}
    </div>
  );
}
