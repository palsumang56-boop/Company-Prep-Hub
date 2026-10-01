import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

// Turns citations like [1] or [1, 3] into links, leaving code spans and code blocks untouched.
function linkCitations(text) {
  return text
    .split(/(```[\s\S]*?(?:```|$)|`[^`\n]*`)/g)
    .map((part, i) => {
      if (i % 2 === 1) return part; // code
      return part.replace(/\[(\d{1,2}(?:\s*,\s*\d{1,2})*)\](?!\()/g, (_, nums) =>
        nums
          .split(',')
          .map((n) => `[${n.trim()}](#cite-${n.trim()})`)
          .join('')
      );
    })
    .join('');
}

export default function Markdown({ text, sources = [] }) {
  const byNumber = new Map(sources.map((s) => [String(s.n), s]));

  const components = {
    a({ href = '', children }) {
      if (href.startsWith('#cite-')) {
        const source = byNumber.get(href.slice(6));
        if (!source) return <span className="pp-cite pp-cite--plain">{children}</span>;
        return (
          <Link className="pp-cite" to={`/question/${source.id}`} title={source.title} aria-label={`Source ${source.n}: ${source.title}`}>
            {children}
          </Link>
        );
      }
      return (
        <a href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    },
    table({ children }) {
      return (
        <div className="pp-table-wrap">
          <table>{children}</table>
        </div>
      );
    },
  };

  return (
    <div className="pp-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {linkCitations(text)}
      </ReactMarkdown>
    </div>
  );
}
