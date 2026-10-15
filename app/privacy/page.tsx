'use client';

import React from 'react';
import {
  AlertTriangle,
  Lock,
  EyeOff,
  Server,
  FileWarning,
  ExternalLink,
} from 'lucide-react';
import { useMail } from '@/context/mail-context';

export default function PrivacyPage() {
  const { t } = useMail();

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {t.privacyTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t.privacySubtitle}
        </p>
      </div>

      {/* Crucial Advisory Card */}
      <div className="p-6 rounded-2xl neu-elevated border-l-4 border-amber-500 space-y-3">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{t.privacyNoticeTitle}</span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {t.privacyNoticeDesc}
        </p>
      </div>

      {/* Grid of Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Client Sanitization */}
        <div className="p-6 rounded-2xl neu-flat space-y-3">
          <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-indigo-500">
            <Lock className="w-5 h-5 stroke-[2]" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.pillar1Title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.pillar1Desc}
          </p>
        </div>

        {/* Pillar 2: Tracking Pixel Blocking */}
        <div className="p-6 rounded-2xl neu-flat space-y-3">
          <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-emerald-500">
            <EyeOff className="w-5 h-5 stroke-[2]" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.pillar2Title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.pillar2Desc}
          </p>
        </div>

        {/* Pillar 3: Attachment Defense */}
        <div className="p-6 rounded-2xl neu-flat space-y-3">
          <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-rose-500">
            <FileWarning className="w-5 h-5 stroke-[2]" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.pillar3Title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.pillar3Desc}
          </p>
        </div>

        {/* Pillar 4: Zero Database Retention */}
        <div className="p-6 rounded-2xl neu-flat space-y-3">
          <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-violet-500">
            <Server className="w-5 h-5 stroke-[2]" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.pillar4Title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.pillar4Desc}
          </p>
        </div>
      </div>

      {/* Provider Policy & Lifecycle */}
      <div className="p-6 rounded-2xl neu-flat space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {t.providerLifecycleTitle}
        </h2>
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            {t.providerLifecycleDesc}
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>{t.providerItem1}</li>
            <li>{t.providerItem2}</li>
            <li>{t.providerItem3}</li>
          </ul>
        </div>

        <div className="pt-3 border-t border-slate-300/40 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">Third-Party Service Provider:</span>
          <a
            href="https://mail.tm"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            Mail.tm Terms & Documentation
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
