export type CodeLanguage = 'html' | 'typescript' | 'css' | 'shell' | 'text';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrap(className: string, content: string): string {
  return `<span class="${className}">${content}</span>`;
}

class RegionStore {
  private readonly regions: string[] = [];

  reserve(content: string, prefix: string): string {
    const token = `\u0000${prefix}${this.regions.length}\u0000`;
    this.regions.push(content);
    return token;
  }

  restore(code: string, prefix: string, wrapFn: (content: string) => string): string {
    const pattern = new RegExp(`\u0000${prefix}(\\d+)\u0000`, 'g');
    return code.replace(pattern, (_, index) => wrapFn(this.regions[Number(index)]));
  }
}

function highlightHtml(code: string): string {
  const comments = new RegionStore();
  let result = escapeHtml(code);

  result = result.replace(/&lt;!--[\s\S]*?--&gt;/g, (match) => comments.reserve(match, 'C'));
  result = result.replace(/(&lt;\/?)([\w-]+)/g, (_, open, tag) => `${open}${wrap('code-hl-tag', tag)}`);
  result = result.replace(
    /([\w:@-]+)(=)(&quot;[^&]*?&quot;|&#39;[^&#]*?&#39;)/g,
    (_, name, eq, value) => `${wrap('code-hl-attr', name)}${eq}${wrap('code-hl-value', value)}`,
  );

  return comments.restore(result, 'C', (match) => wrap('code-hl-comment', match));
}

function highlightTypeScript(code: string): string {
  const comments = new RegionStore();
  const strings = new RegionStore();
  let result = escapeHtml(code);

  result = result.replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, (match) => comments.reserve(match, 'C'));
  result = result.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g, (match) => strings.reserve(match, 'S'));

  const keywords =
    /\b(import|export|from|const|let|var|new|return|interface|type|readonly|private|public|constructor|class|extends|implements|null|true|false|void|async|await)\b/g;

  result = result.replace(keywords, (match) => wrap('code-hl-keyword', match));
  result = comments.restore(result, 'C', (match) => wrap('code-hl-comment', match));
  result = strings.restore(result, 'S', (match) => wrap('code-hl-string', match));

  return result;
}

function highlightCss(code: string): string {
  const comments = new RegionStore();
  const strings = new RegionStore();
  let result = escapeHtml(code);

  result = result.replace(/\/\*[\s\S]*?\*\//g, (match) => comments.reserve(match, 'C'));
  result = result.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g, (match) => strings.reserve(match, 'S'));
  result = result.replace(/(@[\w-]+)/g, (match) => wrap('code-hl-keyword', match));
  result = comments.restore(result, 'C', (match) => wrap('code-hl-comment', match));
  result = strings.restore(result, 'S', (match) => wrap('code-hl-string', match));

  return result;
}

function highlightShell(code: string): string {
  const strings = new RegionStore();
  let result = escapeHtml(code);

  result = result.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g, (match) => strings.reserve(match, 'S'));
  result = result.replace(/^(npm|ng|yarn|pnpm)(\s+)/gm, (_, cmd, space) =>
    `${wrap('code-hl-keyword', cmd)}${space}`,
  );
  result = strings.restore(result, 'S', (match) => wrap('code-hl-string', match));

  return result;
}

export function highlightCode(code: string, language: CodeLanguage): string {
  switch (language) {
    case 'html':
      return highlightHtml(code);
    case 'typescript':
      return highlightTypeScript(code);
    case 'css':
      return highlightCss(code);
    case 'shell':
      return highlightShell(code);
    default:
      return escapeHtml(code);
  }
}
