import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderMarkdown = (md: string) => {
    let html = md;

    // Headers
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 hover:underline" target="_blank">$1</a>');

    // Code blocks
    html = html.replace(/```(.*?)\n([\s\S]*?)```/gm, '<pre class="bg-slate-900 border border-slate-700 rounded p-3 my-2 overflow-x-auto"><code class="text-xs">$2</code></pre>');

    // Inline code
    html = html.replace(/`(.*?)`/g, '<code class="bg-slate-900 px-2 py-1 rounded text-xs font-mono">$1</code>');

    // Lists
    html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4">• $1</li>');
    html = html.replace(/^- (.*?)$/gm, '<li class="ml-4">• $1</li>');
    html = html.replace(/^\d+\. (.*?)$/gm, '<li class="ml-4">$1</li>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="my-3">');
    html = '<p class="my-3">' + html + '</p>';

    // Tables (simple support)
    html = html.replace(/\|/g, ' | ');

    return html;
  };

  return (
    <div
      className="prose prose-invert text-slate-300 text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}

