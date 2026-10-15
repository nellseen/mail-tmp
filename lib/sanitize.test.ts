import { describe, it, expect } from 'vitest';
import { sanitizeEmailHtml } from './sanitize';

describe('sanitizeEmailHtml', () => {
  it('strips dangerous <script> tags and inline script payloads', () => {
    const malicious = 'Hello <script>alert("hacked")</script><b>World</b>';
    const { cleanHtml } = sanitizeEmailHtml(malicious);
    expect(cleanHtml).not.toContain('<script>');
    expect(cleanHtml).not.toContain('alert');
    expect(cleanHtml).toContain('Hello');
    expect(cleanHtml).toContain('<b>World</b>');
  });

  it('strips dangerous event handlers like onerror and onload', () => {
    const malicious = '<img src="x" onerror="alert(1)">';
    const { cleanHtml } = sanitizeEmailHtml(malicious);
    expect(cleanHtml).not.toContain('onerror');
    expect(cleanHtml).not.toContain('alert(1)');
  });

  it('blocks remote images when blockRemoteImages is true', () => {
    const emailWithImages = '<p>Check this: <img src="https://tracker.com/pixel.png" alt="Pixel"></p>';
    const result = sanitizeEmailHtml(emailWithImages, { blockRemoteImages: true });
    expect(result.hasRemoteImages).toBe(true);
    expect(result.cleanHtml).not.toMatch(/\ssrc="/i);
    expect(result.cleanHtml).toContain('data-blocked-src="https://tracker.com/pixel.png"');
  });

  it('allows remote images when blockRemoteImages is false', () => {
    const emailWithImages = '<p>Check this: <img src="https://tracker.com/banner.png" alt="Banner"></p>';
    const result = sanitizeEmailHtml(emailWithImages, { blockRemoteImages: false });
    expect(result.hasRemoteImages).toBe(true);
    expect(result.cleanHtml).toContain('src="https://tracker.com/banner.png"');
  });

  it('enforces rel="noopener noreferrer nofollow" and target="_blank" on links', () => {
    const linkHtml = '<a href="https://example.com">Visit site</a>';
    const { cleanHtml } = sanitizeEmailHtml(linkHtml);
    expect(cleanHtml).toContain('target="_blank"');
    expect(cleanHtml).toContain('noopener noreferrer');
  });
});
