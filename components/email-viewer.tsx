'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Trash2,
  MailCheck,
  Mail,
  Download,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Printer,
  Calendar,
  User,
  Paperclip,
} from 'lucide-react';
import { MailMessageDetail } from '@/lib/types';
import { sanitizeEmailHtml } from '@/lib/sanitize';
import { ConfirmModal } from './confirm-modal';
import { CopyButton } from './copy-button';
import { useMail } from '@/context/mail-context';

interface EmailViewerProps {
  message: MailMessageDetail;
  onBack: () => void;
  onToggleRead: (id: string, seen: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  blockRemoteImagesDefault?: boolean;
}

export function EmailViewer({
  message,
  onBack,
  onToggleRead,
  onDelete,
  blockRemoteImagesDefault = true,
}: EmailViewerProps) {
  const { t } = useMail();
  const [activeTab, setActiveTab] = useState<'html' | 'text'>('html');
  const [allowRemoteImages, setAllowRemoteImages] = useState(!blockRemoteImagesDefault);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Pick first HTML body or fallback to text
  const rawHtml = message.html && message.html.length > 0 ? message.html[0] : '';
  const rawText = message.text || '';

  const { cleanHtml, hasRemoteImages } = useMemo(() => {
    return sanitizeEmailHtml(rawHtml, {
      blockRemoteImages: !allowRemoteImages,
    });
  }, [rawHtml, allowRemoteImages]);

  const handleToggleRead = async () => {
    setIsUpdatingStatus(true);
    try {
      await onToggleRead(message.id, !message.seen);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(message.id);
      onBack();
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formattedDate = useMemo(() => {
    try {
      return new Date(message.createdAt).toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'medium',
      });
    } catch {
      return message.createdAt;
    }
  }, [message.createdAt]);

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Action Header */}
      <div className="p-4 rounded-2xl neu-flat flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl neu-button text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5 text-xs font-semibold"
            aria-label={t.back}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleRead}
            disabled={isUpdatingStatus}
            className="p-2.5 rounded-xl neu-button text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
            title={message.seen ? t.markUnread : t.markRead}
          >
            {message.seen ? (
              <>
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>{t.markUnread}</span>
              </>
            ) : (
              <>
                <MailCheck className="w-4 h-4 text-emerald-500" />
                <span>{t.markRead}</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2.5 rounded-xl neu-button text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            title={t.print}
            aria-label={t.print}
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 rounded-xl neu-button text-rose-500 hover:text-rose-600 inline-flex items-center gap-1.5 text-xs font-semibold"
            title={t.delete}
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.delete}</span>
          </button>
        </div>
      </div>

      {/* Message Metadata Card */}
      <div className="p-5 sm:p-6 rounded-2xl neu-elevated space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 break-words leading-tight">
            {message.subject || t.noSubject}
          </h1>
          <CopyButton textToCopy={message.subject || ''} label={t.copySubject} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-300/40 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2 overflow-hidden">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{t.from}</span>
            <span className="font-mono truncate">{message.from.name ? `${message.from.name} <${message.from.address}>` : message.from.address}</span>
            <CopyButton textToCopy={message.from.address} label={t.copySenderEmail} />
          </div>

          <div className="flex items-center gap-2 overflow-hidden">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{t.date}</span>
            <span className="truncate">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2 overflow-hidden col-span-1 md:col-span-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{t.to}</span>
            <span className="font-mono text-slate-600 dark:text-slate-400 truncate">
              {message.to.map((t) => t.address).join(', ')}
            </span>
          </div>
        </div>

        {/* Remote Images Privacy Notice */}
        {hasRemoteImages && !allowRemoteImages && (
          <div className="p-3 rounded-xl neu-inset flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{t.blockedImagesWarning}</span>
            </div>
            <button
              type="button"
              onClick={() => setAllowRemoteImages(true)}
              className="px-3 py-1.5 rounded-lg neu-button text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0"
            >
              {t.loadExternalImages}
            </button>
          </div>
        )}

        {hasRemoteImages && allowRemoteImages && (
          <div className="p-3 rounded-xl neu-inset flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t.imagesLoadedNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setAllowRemoteImages(false)}
              className="px-2.5 py-1 rounded-lg neu-button text-xs text-slate-600 dark:text-slate-400"
            >
              {t.blockImages}
            </button>
          </div>
        )}
      </div>

      {/* Attachments Section if present */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl neu-flat space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Paperclip className="w-4 h-4 text-indigo-500" />
            <span>{t.attachmentsTitle(message.attachments.length)}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {message.attachments.map((att) => {
              const safeName = att.filename || 'attachment';
              const downloadEndpoint = `/api/mail/attachments?url=${encodeURIComponent(
                att.downloadUrl
              )}&filename=${encodeURIComponent(safeName)}`;

              return (
                <div
                  key={att.id}
                  className="p-3 rounded-xl neu-inset flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={safeName}>
                        {safeName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatFileSize(att.size)} · {att.contentType.split('/')[1] || 'file'}
                      </p>
                    </div>
                  </div>

                  <a
                    href={downloadEndpoint}
                    download={safeName}
                    className="p-2 rounded-lg neu-button text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 shrink-0"
                    title={`${t.downloadAttachment} ${safeName}`}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Message Body Container */}
      <div className="flex-1 p-5 sm:p-6 rounded-2xl neu-inset overflow-hidden flex flex-col min-h-[350px]">
        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-300/40 dark:border-slate-800 pb-3">
          {rawHtml && (
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'html' ? 'neu-pill-active' : 'neu-button text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.richHtmlTab}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'text' || !rawHtml ? 'neu-pill-active' : 'neu-button text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.plainTextTab}
          </button>
        </div>

        {/* Content Render Pane */}
        <div className="flex-1 overflow-y-auto bg-white/70 dark:bg-slate-900/60 p-4 sm:p-6 rounded-xl shadow-inner border border-slate-200/50 dark:border-slate-800/80">
          {activeTab === 'html' && rawHtml ? (
            <div
              className="prose prose-slate dark:prose-invert max-w-none text-sm break-words overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: cleanHtml }}
            />
          ) : (
            <pre className="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
              {rawText || t.emptyBody}
            </pre>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title={t.deleteMessageModalTitle}
        description={t.deleteMessageModalDesc}
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
