import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes HTML content to prevent XSS attacks and script injections
 * @param html The HTML content to sanitize
 * @returns Sanitized HTML content
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html) {
    return '';
  }

  return sanitizeHtml(html, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'p',
      'a',
      'ul',
      'ol',
      'nl',
      'li',
      'b',
      'i',
      'strong',
      'em',
      'strike',
      'code',
      'hr',
      'br',
      'div',
      'table',
      'thead',
      'caption',
      'tbody',
      'tr',
      'th',
      'td',
      'pre',
      'span',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      div: ['class', 'data-*'],
      span: ['class', 'style'],
      p: ['class'],
      table: ['class'],
      th: ['style'],
      td: ['style'],
    },
    // Restrict CSS to prevent malicious styles
    allowedStyles: {
      '*': {
        color: [
          /^#(0x)?[0-9a-f]+$/i,
          /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
        ],
        'text-align': [/^left$/, /^right$/, /^center$/],
        'font-size': [/^\d+(?:px|em|rem|%)$/],
      },
      td: {
        'background-color': [
          /^#(0x)?[0-9a-f]+$/i,
          /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
        ],
        'vertical-align': [/^top$/, /^middle$/, /^bottom$/],
        padding: [/^\d+(?:px|em|rem|%)$/],
      },
      th: {
        'background-color': [
          /^#(0x)?[0-9a-f]+$/i,
          /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
        ],
        'vertical-align': [/^top$/, /^middle$/, /^bottom$/],
        padding: [/^\d+(?:px|em|rem|%)$/],
      },
    },
    // Prevent URLs that start with javascript:
    transformTags: {
      a: (tagName, attribs) => {
        if (
          attribs.href &&
          attribs.href.toLowerCase().startsWith('javascript:')
        ) {
          attribs.href = '#';
        }
        return {
          tagName,
          attribs,
        };
      },
    },
  });
}
