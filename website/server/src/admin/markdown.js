// Minimal, safe-by-construction formatter for blog bodies. All text is HTML-escaped first; only the
// markup produced here can appear in the output, so editors can't inject scripts or attributes.
//   **bold**   *italic*   [link text](https://…)   ## Heading   ### Subheading   - list item   > quote

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function inline(text) {
  let out = escapeHtml(text);
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
    const decoded = url.replace(/&amp;/g, '&');
    if (!/^(https?:\/\/|mailto:|\/(?!\/))/i.test(decoded)) return label;
    const external = /^https?:\/\//i.test(decoded);
    return `<a href="${escapeHtml(decoded)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
  });
  return out;
}

export function renderMarkdown(src = '') {
  const blocks = String(src).replace(/\r\n?/g, '\n').trim().split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block.split('\n');
      if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
        return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('')}</ul>`;
      }
      if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
        return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`;
      }
      if (lines.every((l) => /^>\s?/.test(l))) {
        return `<blockquote><p>${lines.map((l) => inline(l.replace(/^>\s?/, ''))).join('<br>')}</p></blockquote>`;
      }
      const h = block.match(/^(#{2,3})\s+(.+)$/);
      if (h && lines.length === 1) return `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;
      return `<p>${lines.map(inline).join('<br>')}</p>`;
    })
    .filter((b) => b !== '<p></p>')
    .join('\n');
}
