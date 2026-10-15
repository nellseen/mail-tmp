'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Inbox,
  RefreshCw,
  Plus,
  Shield,
  Zap,
  HardDrive,
  Clock,
  ArrowRight,
  CheckCircle,
  FileText,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useMail } from '@/context/mail-context';
import { CopyButton } from '@/components/copy-button';
import { NewMailboxModal } from '@/components/new-mailbox-modal';
import { EmptyState } from '@/components/empty-state';

export default function HomePage() {
  const {
    currentSession,
    account,
    messages,
    totalMessages,
    unreadCount,
    isSyncing,
    isCreatingMailbox,
    refreshMessages,
    t,
  } = useMail();

  const [showNewMailboxModal, setShowNewMailboxModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 KB';
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Hero Mailbox Card */}
      <section className="p-6 sm:p-8 rounded-3xl neu-elevated relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neu-inset text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Zap className="w-3.5 h-3.5" />
              <span>{t.instantInbox}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {t.heroTitle}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => refreshMessages(false)}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold neu-button text-slate-700 dark:text-slate-300 inline-flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-500' : ''}`} />
              <span>{t.checkMail}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNewMailboxModal(true)}
              disabled={isCreatingMailbox}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold neu-button-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newAddress}</span>
            </button>
          </div>
        </div>

        {/* Big Address & Password Display Box */}
        <div className="mt-6 p-4 sm:p-6 rounded-2xl neu-inset space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t.yourCurrentEmail}</span>
              </div>

              <p className="font-mono text-base sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 select-all truncate">
                {isCreatingMailbox
                  ? t.allocatingMailbox
                  : currentSession?.address || t.generatingAddress}
              </p>
            </div>

            {currentSession?.address && (
              <div className="flex items-center gap-2 shrink-0">
                <CopyButton
                  textToCopy={currentSession.address}
                  label={t.copyAddress}
                  showText
                  className="py-2.5 px-4 text-xs font-bold w-full md:w-auto justify-center"
                />
              </div>
            )}
          </div>

          {/* Password info in hero */}
          {currentSession?.password && (
            <div className="pt-3 border-t border-slate-300/40 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-600 dark:text-slate-400">{t.passwordLabel}:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {showPassword ? currentSession.password : '••••••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <CopyButton textToCopy={currentSession.password} label={t.copyPassword} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Real Mailbox Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl neu-flat flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl neu-inset flex items-center justify-center text-indigo-500 shrink-0">
            <Inbox className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.totalReceived}</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {totalMessages}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl neu-flat flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl neu-inset flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.unreadMails}</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {unreadCount}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl neu-flat flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl neu-inset flex items-center justify-center text-emerald-500 shrink-0">
            <HardDrive className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.storageUsed}</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 truncate">
              {account ? formatBytes(account.used) : '0 KB'}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl neu-flat flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl neu-inset flex items-center justify-center text-violet-500 shrink-0">
            <Shield className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.mailboxStatus}</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{t.statusActive}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Recent Messages Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t.recentMessages}
            </h2>
            {totalMessages > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold neu-inset text-indigo-600 dark:text-indigo-400">
                {totalMessages}
              </span>
            )}
          </div>

          {totalMessages > 0 && (
            <Link
              href="/inbox"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{t.viewAllInbox}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {messages.length === 0 ? (
          <EmptyState
            type="inbox"
            emailAddress={currentSession?.address}
            onRefresh={() => refreshMessages(false)}
            isRefreshing={isSyncing}
          />
        ) : (
          <div className="space-y-3">
            {messages.slice(0, 5).map((msg) => (
              <Link
                key={msg.id}
                href={`/inbox?id=${msg.id}`}
                className={`p-4 rounded-2xl neu-flat block transition-all hover:translate-y-[-1px] ${
                  !msg.seen ? 'border-l-4 border-indigo-500 pl-3.5' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {msg.from.name || msg.from.address}
                      </span>
                      {!msg.seen && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white shrink-0">
                          {t.newBadge}
                        </span>
                      )}
                      {msg.hasAttachments && (
                        <span className="p-1 rounded-md neu-inset text-slate-500" title="Has attachments">
                          <FileText className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {msg.subject || t.noSubject}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl">
                      {msg.intro || t.noPreview}
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Modal for Creating Custom Mailbox with Password */}
      <NewMailboxModal
        isOpen={showNewMailboxModal}
        onClose={() => setShowNewMailboxModal(false)}
      />
    </div>
  );
}
