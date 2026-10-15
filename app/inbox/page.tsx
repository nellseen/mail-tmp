'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  RefreshCw,
  Mail,
  MailCheck,
  Trash2,
  Filter,
  Search,
  Paperclip,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useMail } from '@/context/mail-context';
import { MailMessageDetail } from '@/lib/types';
import { EmailViewer } from '@/components/email-viewer';
import { EmptyState } from '@/components/empty-state';
import { ConfirmModal } from '@/components/confirm-modal';

function InboxContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedMessageId = searchParams.get('id');

  const {
    currentSession,
    messages,
    totalMessages,
    isSyncing,
    refreshMessages,
    markMessageRead,
    deleteMessage,
    settings,
    t,
  } = useMail();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'attachments'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailedMessage, setDetailedMessage] = useState<MailMessageDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Fetch full message detail when selectedMessageId changes
  useEffect(() => {
    if (!selectedMessageId || !currentSession?.token) {
      setDetailedMessage(null);
      setDetailError(null);
      return;
    }

    let isMounted = true;
    setIsLoadingDetail(true);
    setDetailError(null);

    fetch(`/api/mail/messages/${selectedMessageId}`, {
      headers: { Authorization: `Bearer ${currentSession.token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Failed to fetch email (HTTP ${res.status})`);
        }
        return res.json();
      })
      .then((data: MailMessageDetail) => {
        if (!isMounted) return;
        setDetailedMessage(data);

        // Automatically mark as read if not seen yet
        if (!data.seen) {
          markMessageRead(data.id, true);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setDetailError(err.message || 'Error loading message content');
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetail(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMessageId, currentSession?.token, markMessageRead]);

  // Filter and search over retrieved messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      if (activeFilter === 'unread' && msg.seen) return false;
      if (activeFilter === 'attachments' && !msg.hasAttachments) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchSubject = (msg.subject || '').toLowerCase().includes(query);
        const matchFrom =
          (msg.from.name || '').toLowerCase().includes(query) ||
          msg.from.address.toLowerCase().includes(query);
        const matchIntro = (msg.intro || '').toLowerCase().includes(query);
        return matchSubject || matchFrom || matchIntro;
      }

      return true;
    });
  }, [messages, activeFilter, searchTerm]);

  // Handle Selection
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMessages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map((m) => m.id)));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Bulk Read/Unread
  const handleBulkMarkRead = async (seen: boolean) => {
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => markMessageRead(id, seen)));
    setSelectedIds(new Set());
  };

  // Bulk Delete
  const handleConfirmBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => deleteMessage(id)));
      setSelectedIds(new Set());
      if (selectedMessageId && selectedIds.has(selectedMessageId)) {
        router.push('/inbox');
      }
    } finally {
      setIsDeletingBulk(false);
      setShowBulkDeleteModal(false);
    }
  };

  const handleSelectMessage = (id: string) => {
    router.push(`/inbox?id=${id}`);
  };

  const handleBackToInbox = () => {
    router.push('/inbox');
    setDetailedMessage(null);
  };

  return (
    <div className="space-y-4">
      {/* If a message is selected, display the rich email viewer */}
      {selectedMessageId ? (
        <div>
          {isLoadingDetail && (
            <div className="p-12 text-center rounded-2xl neu-inset">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t.fetchingFromProvider}
              </p>
            </div>
          )}

          {detailError && (
            <div className="p-6 rounded-2xl neu-inset border border-rose-300 dark:border-rose-900 text-center space-y-3">
              <p className="text-rose-600 dark:text-rose-400 font-bold text-sm">
                {detailError}
              </p>
              <button
                type="button"
                onClick={handleBackToInbox}
                className="px-4 py-2 rounded-xl neu-button text-xs font-semibold"
              >
                {t.returnToInbox}
              </button>
            </div>
          )}

          {detailedMessage && !isLoadingDetail && (
            <EmailViewer
              message={detailedMessage}
              onBack={handleBackToInbox}
              onToggleRead={markMessageRead}
              onDelete={deleteMessage}
              blockRemoteImagesDefault={settings.blockRemoteImages}
            />
          )}
        </div>
      ) : (
        /* Message List View */
        <div className="space-y-4">
          {/* Controls Header */}
          <div className="p-4 rounded-2xl neu-flat flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'all'
                    ? 'neu-pill-active'
                    : 'neu-button text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.filterAll} ({messages.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('unread')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'unread'
                    ? 'neu-pill-active'
                    : 'neu-button text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.filterUnread} ({messages.filter((m) => !m.seen).length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('attachments')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'attachments'
                    ? 'neu-pill-active'
                    : 'neu-button text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.filterAttachments} ({messages.filter((m) => m.hasAttachments).length})
              </button>
            </div>

            {/* Search Input in Inbox */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.filterCurrentViewPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl neu-inset bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Bulk Action Toolbar if items are selected */}
          {selectedIds.size > 0 && (
            <div className="p-3 rounded-xl neu-inset flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {t.selectedCount(selectedIds.size)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkMarkRead(true)}
                  className="px-3 py-1.5 rounded-lg neu-button text-slate-700 dark:text-slate-300 font-semibold inline-flex items-center gap-1.5"
                >
                  <MailCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t.markRead}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkMarkRead(false)}
                  className="px-3 py-1.5 rounded-lg neu-button text-slate-700 dark:text-slate-300 font-semibold inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t.markUnread}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="px-3 py-1.5 rounded-lg neu-button text-rose-500 font-semibold inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.deleteSelected}</span>
                </button>
              </div>
            </div>
          )}

          {/* Messages Table / List */}
          {filteredMessages.length === 0 ? (
            messages.length === 0 ? (
              <EmptyState
                type="inbox"
                emailAddress={currentSession?.address}
                onRefresh={() => refreshMessages(false)}
                isRefreshing={isSyncing}
              />
            ) : (
              <EmptyState type="search" />
            )
          ) : (
            <div className="space-y-2.5">
              {/* Select All Row */}
              <div className="px-4 py-2 flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  {selectedIds.size === filteredMessages.length ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{t.selectAll}</span>
                </button>
                <span>•</span>
                <span>{t.messagesCount(filteredMessages.length)}</span>
              </div>

              {filteredMessages.map((msg) => {
                const isSelected = selectedIds.has(msg.id);

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg.id)}
                    className={`p-4 rounded-2xl neu-flat cursor-pointer transition-all duration-150 hover:translate-y-[-1px] flex items-center gap-3.5 ${
                      !msg.seen ? 'border-l-4 border-indigo-500 pl-3.5' : ''
                    } ${isSelected ? 'ring-2 ring-indigo-500/40' : ''}`}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => toggleSelectOne(msg.id, e)}
                      aria-label="Select message"
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-500 shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    {/* Sender & Subject */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm truncate ${
                            !msg.seen
                              ? 'font-extrabold text-slate-900 dark:text-slate-100'
                              : 'font-semibold text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {msg.from.name || msg.from.address}
                        </span>

                        {!msg.seen && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        )}

                        {msg.hasAttachments && (
                          <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`truncate ${
                            !msg.seen
                              ? 'font-bold text-slate-800 dark:text-slate-200'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {msg.subject || t.noSubject}
                        </span>
                        <span className="text-slate-400 shrink-0">—</span>
                        <span className="text-slate-500 dark:text-slate-500 truncate">
                          {msg.intro || t.noPreview}
                        </span>
                      </div>
                    </div>

                    {/* Date / Timestamp */}
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Bulk Deletion */}
      <ConfirmModal
        isOpen={showBulkDeleteModal}
        title={t.deleteBulkModalTitle(selectedIds.size)}
        description={t.deleteBulkModalDesc}
        confirmLabel={t.deleteSelected}
        cancelLabel={t.cancel}
        isDestructive
        isLoading={isDeletingBulk}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setShowBulkDeleteModal(false)}
      />
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center rounded-2xl neu-inset">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">Loading...</p>
        </div>
      }
    >
      <InboxContent />
    </Suspense>
  );
}
