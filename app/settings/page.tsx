'use client';

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Volume2,
  VolumeX,
  Shield,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  ExternalLink,
  Globe,
  Instagram,
  Heart,
} from 'lucide-react';
import { useMail } from '@/context/mail-context';
import { playNotificationSound } from '@/lib/sound';
import { ConfirmModal } from '@/components/confirm-modal';
import { Language } from '@/lib/i18n';

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    currentSession,
    deleteMailboxAccount,
    clearSavedSessions,
    savedSessions,
    language,
    setLanguage,
    t,
  } = useMail();

  const [notificationState, setNotificationState] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );

  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const triggerToast = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    triggerToast();
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    triggerToast();
  };

  const handleRefreshIntervalChange = (val: number) => {
    updateSettings({ refreshInterval: val });
    triggerToast();
  };

  const handleSoundToggle = () => {
    const next = !settings.soundAlerts;
    updateSettings({ soundAlerts: next });
    if (next) {
      playNotificationSound();
    }
    triggerToast();
  };

  const handleRequestNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser notifications are not supported in this environment.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationState(permission);
      if (permission === 'granted') {
        updateSettings({ browserNotifications: true });
        new Notification('AetherMail Notifications Enabled', {
          body: 'You will receive alerts when new temporary emails arrive.',
        });
      } else {
        updateSettings({ browserNotifications: false });
      }
      triggerToast();
    } catch {
      // Permission request error
    }
  };

  const handleExportCredentials = () => {
    if (!currentSession) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify(
        {
          provider: 'Mail.tm',
          address: currentSession.address,
          password: currentSession.password || '(not stored)',
          accountId: currentSession.id,
          createdAt: currentSession.createdAt,
          exportedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aethermail_${currentSession.address.split('@')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleConfirmClearHistory = () => {
    clearSavedSessions();
    setShowClearHistoryModal(false);
    triggerToast();
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteMailboxAccount();
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountModal(false);
      triggerToast();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {t.settingsTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t.settingsSubtitle}
          </p>
        </div>

        {showSavedToast && (
          <div className="px-3.5 py-1.5 rounded-xl neu-inset text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{t.settingsSaved}</span>
          </div>
        )}
      </div>

      {/* Language / Bahasa Selection Section */}
      <section className="p-6 rounded-2xl neu-flat space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500" />
          <span>{t.languageSectionTitle}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleLanguageChange('id')}
            className={`p-4 rounded-xl text-left flex items-center gap-3 transition-all ${
              language === 'id' ? 'neu-pill-active' : 'neu-button text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center font-bold text-xs">
              ID
            </div>
            <div>
              <p className="font-bold text-xs">Bahasa Indonesia</p>
              <p className="text-[11px] text-slate-500">Antarmuka dalam Bahasa Indonesia</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`p-4 rounded-xl text-left flex items-center gap-3 transition-all ${
              language === 'en' ? 'neu-pill-active' : 'neu-button text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center font-bold text-xs">
              EN
            </div>
            <div>
              <p className="font-bold text-xs">English</p>
              <p className="text-[11px] text-slate-500">Standard English interface</p>
            </div>
          </button>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="p-6 rounded-2xl neu-flat space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>{t.appearanceTitle}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-xl text-left flex items-center gap-3 transition-all ${
              settings.theme === 'light' ? 'neu-pill-active' : 'neu-button text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-bold text-xs">{t.lightMode}</p>
              <p className="text-[11px] text-slate-500">{t.lightModeDesc}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-xl text-left flex items-center gap-3 transition-all ${
              settings.theme === 'dark' ? 'neu-pill-active' : 'neu-button text-slate-700 dark:text-slate-300'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="font-bold text-xs">{t.darkMode}</p>
              <p className="text-[11px] text-slate-500">{t.darkModeDesc}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`p-4 rounded-xl text-left flex items-center gap-3 transition-all ${
              settings.theme === 'system' ? 'neu-pill-active' : 'neu-button text-slate-700 dark:text-slate-300'
            }`}
          >
            <Monitor className="w-5 h-5 text-slate-500" />
            <div>
              <p className="font-bold text-xs">{t.systemMode}</p>
              <p className="text-[11px] text-slate-500">{t.systemModeDesc}</p>
            </div>
          </button>
        </div>
      </section>

      {/* Sync & Polling Section */}
      <section className="p-6 rounded-2xl neu-flat space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-indigo-500" />
          <span>{t.syncFrequencyTitle}</span>
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          {t.syncFrequencyDesc}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t.freq10s, value: 10 },
            { label: t.freq15s, value: 15 },
            { label: t.freq30s, value: 30 },
            { label: t.freqManual, value: 0 },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleRefreshIntervalChange(opt.value)}
              className={`p-3 rounded-xl text-xs font-bold transition-all text-center ${
                settings.refreshInterval === opt.value
                  ? 'neu-pill-active'
                  : 'neu-button text-slate-700 dark:text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications and Audio Alerts */}
      <section className="p-6 rounded-2xl neu-flat space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-violet-500" />
          <span>{t.alertsTitle}</span>
        </h2>

        <div className="space-y-3">
          {/* Audio Chime Toggle */}
          <div className="p-4 rounded-xl neu-inset flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {settings.soundAlerts ? (
                <Volume2 className="w-5 h-5 text-indigo-500 shrink-0" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.audioChimeTitle}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.audioChimeDesc}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSoundToggle}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                settings.soundAlerts ? 'neu-pill-active' : 'neu-button text-slate-600'
              }`}
            >
              {settings.soundAlerts ? t.enabled : t.disabled}
            </button>
          </div>

          {/* Browser System Notification Toggle */}
          <div className="p-4 rounded-xl neu-inset flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.browserNotificationsTitle}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.statusLabel} <span className="font-semibold uppercase">{notificationState}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestNotifications}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold neu-button text-indigo-600 dark:text-indigo-400"
            >
              {notificationState === 'granted' ? t.reTest : t.enableInBrowser}
            </button>
          </div>
        </div>
      </section>

      {/* Privacy & Image Blocking Section */}
      <section className="p-6 rounded-2xl neu-flat space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>{t.emailPrivacyTitle}</span>
        </h2>

        <div className="p-4 rounded-xl neu-inset flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t.blockRemoteImagesTitle}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md">
              {t.blockRemoteImagesDesc}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              updateSettings({ blockRemoteImages: !settings.blockRemoteImages });
              triggerToast();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
              settings.blockRemoteImages ? 'neu-pill-active' : 'neu-button text-slate-600'
            }`}
          >
            {settings.blockRemoteImages ? t.shielded : t.allowed}
          </button>
        </div>
      </section>

      {/* Session Management & Credentials Export */}
      <section className="p-6 rounded-2xl neu-flat space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-500" />
          <span>{t.sessionManagementTitle}</span>
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCredentials}
            disabled={!currentSession}
            className="px-4 py-2 rounded-xl neu-button text-xs font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportCredentialsBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearHistoryModal(true)}
            disabled={savedSessions.length === 0}
            className="px-4 py-2 rounded-xl neu-button text-xs font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearSavedHistoryBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteAccountModal(true)}
            disabled={!currentSession}
            className="px-4 py-2 rounded-xl neu-button text-rose-500 font-semibold text-xs inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.deleteMailboxOnProviderBtn}</span>
          </button>
        </div>
      </section>

      {/* About Creator: Nells */}
      <section className="p-6 rounded-2xl neu-flat space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>Tentang Pengembang / About Creator</span>
        </h2>

        <div className="p-4 rounded-xl neu-inset flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl neu-button-primary flex items-center justify-center font-black text-base text-white shrink-0">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Nells
                </p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                  Developer
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Created with passion & precision using Soft Neumorphism design system.
              </p>
            </div>
          </div>

          <a
            href="https://www.instagram.com/tianshirrr_?vrfl=MXF1NjVuOWswdm95Zg=="
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl neu-button text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 inline-flex items-center gap-2 shrink-0"
            title="Kunjungi Instagram Nells"
          >
            <Instagram className="w-4 h-4 shrink-0" />
            <span>@tianshirrr_</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* Provider Details & Terms */}
      <section className="p-5 rounded-2xl neu-inset text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {t.providerAttributionTitle}
          </span>
          <a
            href="https://mail.tm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold inline-flex items-center gap-1"
          >
            Mail.tm Website
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p>
          {t.providerAttributionDesc}
        </p>
      </section>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showClearHistoryModal}
        title={t.clearHistoryModalTitle}
        description={t.clearHistoryModalDesc}
        confirmLabel={t.clearHistory}
        cancelLabel={t.cancel}
        onConfirm={handleConfirmClearHistory}
        onCancel={() => setShowClearHistoryModal(false)}
      />

      <ConfirmModal
        isOpen={showDeleteAccountModal}
        title={t.deleteAccountModalTitle}
        description={t.deleteAccountModalDesc(currentSession?.address || '')}
        confirmLabel={t.deleteMailbox}
        cancelLabel={t.cancel}
        isDestructive
        isLoading={isDeletingAccount}
        onConfirm={handleConfirmDeleteAccount}
        onCancel={() => setShowDeleteAccountModal(false)}
      />
    </div>
  );
}
