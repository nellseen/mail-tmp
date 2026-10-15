'use client';

import React from 'react';
import { Mail, RefreshCw, Sparkles } from 'lucide-react';
import { CopyButton } from './copy-button';
import { useMail } from '@/context/mail-context';

interface EmptyStateProps {
  type: 'inbox' | 'search' | 'generic';
  emailAddress?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function EmptyState({
  type,
  emailAddress,
  onRefresh,
  isRefreshing,
}: EmptyStateProps) {
  const { t } = useMail();

  if (type === 'search') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl neu-inset max-w-lg mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl neu-flat flex items-center justify-center text-slate-400 mb-4">
          <Mail className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
          {t.noMatchingSearch}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          {t.noMatchingSearchDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl neu-inset max-w-xl mx-auto my-6">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl neu-flat flex items-center justify-center text-indigo-500">
          <Mail className="w-8 h-8 stroke-[1.5]" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
        {t.readyListeningTitle}
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {t.readyListeningDesc}
      </p>

      {emailAddress && (
        <div className="w-full max-w-md p-3.5 rounded-xl neu-flat flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 overflow-hidden text-left w-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {emailAddress}
            </span>
          </div>
          <CopyButton
            textToCopy={emailAddress}
            label={t.copyAddress}
            showText
            className="shrink-0 w-full sm:w-auto justify-center"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-xl text-xs font-semibold neu-button text-slate-700 dark:text-slate-300 inline-flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{t.checkMail}</span>
          </button>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-300/40 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
        <span>{t.tipSendTest}</span>
      </div>
    </div>
  );
}
