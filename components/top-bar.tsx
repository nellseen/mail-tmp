'use client';

import React, { useState, useEffect } from 'react';
import { Menu, RefreshCw, Plus, AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import { useMail } from '@/context/mail-context';
import { CopyButton } from './copy-button';
import { NewMailboxModal } from './new-mailbox-modal';

interface TopBarProps {
  onOpenMobile: () => void;
}

export function TopBar({ onOpenMobile }: TopBarProps) {
  const {
    currentSession,
    isSyncing,
    lastSyncedAt,
    syncError,
    refreshMessages,
    createRandomMailbox,
    isCreatingMailbox,
    language,
    setLanguage,
    t,
  } = useMail();

  const [timeAgo, setTimeAgo] = useState<string>('Just now');
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);

  // Update relative time ago string
  useEffect(() => {
    if (!lastSyncedAt) {
      setTimeAgo(t.neverSynced);
      return;
    }

    const updateAgo = () => {
      const seconds = Math.floor((Date.now() - new Date(lastSyncedAt).getTime()) / 1000);
      if (seconds < 5) {
        setTimeAgo(t.syncedJustNow);
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s`);
      } else {
        const mins = Math.floor(seconds / 60);
        setTimeAgo(`${mins}m`);
      }
    };

    updateAgo();
    const interval = setInterval(updateAgo, 5000);
    return () => clearInterval(interval);
  }, [lastSyncedAt, t]);

  const handleConfirmNewAddress = async () => {
    setShowNewAddressModal(false);
    await createRandomMailbox();
  };

  return (
    <>
      <header className="sticky top-0 z-30 p-3 sm:p-4 neu-flat border-b border-slate-300/30 dark:border-slate-800/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Mobile hamburger + Logo for small screens */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenMobile}
              aria-label="Open mobile navigation menu"
              className="p-2.5 rounded-xl neu-button md:hidden text-slate-700 dark:text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Active Mailbox Bar on Desktop / Tablet */}
            {currentSession && (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl neu-inset">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[220px] lg:max-w-xs truncate">
                  {currentSession.address}
                </span>
                <CopyButton textToCopy={currentSession.address} label={t.copyAddress} />
              </div>
            )}
          </div>

          {/* Sync Status & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Language Toggle on Mobile/TopBar */}
            <div className="flex items-center p-1 rounded-xl neu-inset text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                aria-label="Bahasa Indonesia"
                className={`px-2 py-1 rounded-lg transition-all ${
                  language === 'id'
                    ? 'neu-pill-active text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                aria-label="English"
                className={`px-2 py-1 rounded-lg transition-all ${
                  language === 'en'
                    ? 'neu-pill-active text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>

            {/* Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-xl neu-inset">
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                  <span>{t.checkingMailTm}</span>
                </>
              ) : syncError ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400 truncate max-w-[150px]" title={syncError}>
                    {t.syncNotice}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{timeAgo === t.syncedJustNow || timeAgo === t.neverSynced ? timeAgo : t.syncedAgo(timeAgo)}</span>
                </>
              )}
            </div>

            {/* Manual Sync Button */}
            <button
              type="button"
              onClick={() => refreshMessages(false)}
              disabled={isSyncing}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold neu-button text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5 disabled:opacity-50"
              title={t.checkMail}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-500' : ''}`} />
              <span className="hidden sm:inline">{t.refresh}</span>
            </button>

            {/* Generate New Address Button */}
            <button
              type="button"
              onClick={() => setShowNewAddressModal(true)}
              disabled={isCreatingMailbox}
              className="px-3 py-2 rounded-xl text-xs font-bold neu-button-primary inline-flex items-center gap-1.5 disabled:opacity-50"
              title={t.newAddress}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">{t.newAddress}</span>
            </button>
          </div>
        </div>

        {/* Mobile address sub-bar */}
        {currentSession && (
          <div className="sm:hidden mt-2.5 pt-2 border-t border-slate-300/30 dark:border-slate-800/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {currentSession.address}
              </span>
            </div>
            <CopyButton textToCopy={currentSession.address} label={t.copyAddress} />
          </div>
        )}
      </header>

      {/* Interactive Modal for Creating Custom Mailbox with Password */}
      <NewMailboxModal
        isOpen={showNewAddressModal}
        onClose={() => setShowNewAddressModal(false)}
      />
    </>
  );
}
