import { describe, it, expect } from 'vitest';
import { translations, getTranslation, Language } from './i18n';

describe('i18n Language & Translation Tests', () => {
  it('loads Indonesian translations by default or when requested', () => {
    const id = getTranslation('id');
    expect(id.brandName).toBe('AetherMail');
    expect(id.navDashboard).toBe('Dasbor');
    expect(id.navInbox).toBe('Kotak Masuk');
    expect(id.navSearch).toBe('Pencarian & Filter');
    expect(id.navAddresses).toBe('Kelola Alamat');
    expect(id.navSettings).toBe('Pengaturan');
    expect(id.navPrivacy).toBe('Privasi & Keamanan');
    expect(id.refresh).toBe('Segarkan');
    expect(id.newAddress).toBe('Alamat Baru');
    expect(id.copyAddress).toBe('Salin Alamat');
  });

  it('loads English translations when requested', () => {
    const en = getTranslation('en');
    expect(en.brandName).toBe('AetherMail');
    expect(en.navDashboard).toBe('Dashboard');
    expect(en.navInbox).toBe('Inbox');
    expect(en.navSearch).toBe('Search & Filter');
    expect(en.navAddresses).toBe('Address Manager');
    expect(en.navSettings).toBe('Settings');
    expect(en.navPrivacy).toBe('Privacy & Security');
    expect(en.refresh).toBe('Refresh');
    expect(en.newAddress).toBe('New Address');
    expect(en.copyAddress).toBe('Copy Address');
  });

  it('verifies that all dictionary keys are fully mirrored in both languages', () => {
    const enKeys = Object.keys(translations.en).sort();
    const idKeys = Object.keys(translations.id).sort();

    expect(idKeys).toEqual(enKeys);
  });

  it('formats parametric translation strings correctly in both languages', () => {
    const en = getTranslation('en');
    const id = getTranslation('id');

    expect(en.selectedCount(1)).toBe('1 message selected');
    expect(en.selectedCount(3)).toBe('3 messages selected');
    expect(id.selectedCount(3)).toBe('3 pesan dipilih');

    expect(en.attachmentsTitle(2)).toBe('Attachments (2)');
    expect(id.attachmentsTitle(2)).toBe('Lampiran (2)');

    expect(en.deleteAccountModalDesc('test@example.com')).toContain('test@example.com');
    expect(id.deleteAccountModalDesc('test@example.com')).toContain('test@example.com');
  });

  it('falls back to English gracefully if unknown language code is passed', () => {
    const fallback = getTranslation('fr' as Language);
    expect(fallback.navInbox).toBe('Inbox');
  });
});
