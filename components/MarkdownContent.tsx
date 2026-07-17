'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  if (!content.trim()) {
    return <p className="text-lucina-muted text-sm italic">Nothing to preview yet.</p>;
  }

  return (
    <div className={`markdown-content text-lucina-primary text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-lucina-primary mt-6 mb-3 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-lucina-primary mt-5 mb-2 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-lucina-primary mt-4 mb-2 first:mt-0">{children}</h3>
          ),
          p: ({ children }) => <p className="my-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-lucina-primary">{children}</strong>,
          em: ({ children }) => <em className="italic text-lucina-primary">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lucina-secondary hover:text-lucina-secondary hover:underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="my-2 list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal pl-5 space-y-1">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-lucina-rose pl-4 text-lucina-muted italic">
              {children}
            </blockquote>
          ),
          // Inline code: light chip + dark text (never dark-on-dark).
          // Block code lives inside <pre>; reset chip styles there.
          code: ({ className: codeClassName, children }) => {
            const isFenced = Boolean(codeClassName?.includes('language-'));
            if (isFenced) {
              return (
                <code
                  className={`${codeClassName ?? ''} block whitespace-pre font-mono text-xs text-lucina-primary bg-transparent p-0`}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded-md bg-lucina-cream/90 px-1.5 py-0.5 text-xs font-mono text-lucina-primary border border-lucina-rose/60">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-lg border border-lucina-rose bg-lucina-white p-3 text-xs font-mono text-lucina-primary [&_code]:bg-transparent [&_code]:border-0 [&_code]:p-0 [&_code]:text-lucina-primary [&_code]:text-xs">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-lucina-rose bg-lucina-white">
              <table className="min-w-full border-collapse text-xs text-lucina-primary">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-lucina-rose bg-lucina-surface px-3 py-2 text-left font-semibold text-lucina-primary">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-lucina-rose/60 px-3 py-2 text-lucina-primary align-top">
              {children}
            </td>
          ),
          hr: () => <hr className="my-4 border-lucina-rose" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}