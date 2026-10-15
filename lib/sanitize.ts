import DOMPurify from 'isomorphic-dompurify';

export interface SanitizeOptions {
  blockRemoteImages?: boolean;
}

export function sanitizeEmailHtml(rawHtml: string, options: SanitizeOptions = {}): {
  cleanHtml: string;
  hasRemoteImages: boolean;
} {
  if (!rawHtml) {
    return { cleanHtml: '', hasRemoteImages: false };
  }

  let hasRemoteImages = false;

  // Configure DOMPurify hooks
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // Set all links to open safely in a new tab
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer nofollow');
    }

    // Inspect image sources
    if (node.tagName === 'IMG') {
      const src = node.getAttribute('src');
      if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
        hasRemoteImages = true;
        if (options.blockRemoteImages) {
          node.setAttribute('data-blocked-src', src);
          node.removeAttribute('src');
          node.setAttribute(
            'style',
            'display: inline-block; padding: 6px 12px; background: #e2e8f0; color: #64748b; font-size: 12px; border-radius: 6px; border: 1px dashed #cbd5e1; margin: 4px 0;'
          );
          node.setAttribute('alt', `[External image blocked: ${node.getAttribute('alt') || 'Image'}]`);
        }
      }
    }
  });

  const clean = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'a', 'b', 'i', 'u', 'em', 'strong', 'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tfoot', 'tr',
      'th', 'td', 'span', 'div', 'img', 'font', 'center', 'sub', 'sup', 'strike', 's', 'del',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height', 'style',
      'align', 'valign', 'border', 'cellpadding', 'cellspacing', 'color', 'size', 'bgcolor',
      'class', 'data-blocked-src',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });

  // Remove hook to avoid leaking into other sanitizations
  DOMPurify.removeHook('afterSanitizeAttributes');

  return {
    cleanHtml: typeof clean === 'string' ? clean : '',
    hasRemoteImages,
  };
}
