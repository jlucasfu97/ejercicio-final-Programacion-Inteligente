import { safeReturnUrl } from './return-url';

describe('safeReturnUrl', () => {
  it('keeps internal paths', () => {
    expect(safeReturnUrl('/activities/activity-2')).toBe('/activities/activity-2');
  });

  it('falls back for empty, external, protocol-relative or login urls', () => {
    for (const url of [undefined, null, '', 'https://evil.com', '//evil.com', '/login?x=1']) {
      expect(safeReturnUrl(url)).toBe('/activities');
    }
  });
});
