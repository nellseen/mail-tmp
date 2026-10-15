'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Paperclip,
  X,
  ArrowRight,
} from 'lucide-react';
import { useMail } from '@/context/mail-context';
import { EmptyState } from '@/components/empty-state';

export default function SearchPage() {
  const { messages, currentSession, t } = useMail();

  const [query, setQuery] = useState('');
  const [filterReadStatus, setFilterReadStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [filterAttachments, setFilterAttachments] = useState<'all' | 'with_attachments'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const filteredResults = useMemo(() => {
    return messages
      .filter((msg) => {
        // Read status filter
        if (filterReadStatus === 'unread' && msg.seen) return false;
        if (filterReadStatus === 'read' && !msg.seen) return false;

        // Attachment filter
        if (filterAttachments === 'with_attachments' && !msg.hasAttachments) return false;

        // Text query matching
        if (query.trim()) {
          const q = query.toLowerCase().trim();
          const matchSubject = (msg.subject || '').toLowerCase().includes(q);
          const matchFrom =
            (msg.from.name || '').toLowerCase().includes(q) ||
            (msg.from.address || '').toLowerCase().includes(q);
          const matchIntro = (msg.intro || '').toLowerCase().includes(q);
          const matchTo = msg.to.some((t) => t.address.toLowerCase().includes(q));

          return matchSubject || matchFrom || matchIntro || matchTo;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [messages, query, filterReadStatus, filterAttachments, sortBy]);

  const hasActiveFilters =
    query.trim() !== '' ||
    filterReadStatus !== 'all' ||
    filterAttachments !== 'all' ||
    sortBy !== 'newest';

  const resetFilters = () => {
    setQuery('');
    setFilterReadStatus('all');
    setFilterAttachments('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {t.searchTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t.searchSubtitle} {currentSession?.address}.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-4 sm:p-6 rounded-2xl neu-flat space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 rounded-xl neu-inset bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{t.filtersLabel}</span>
            </span>

            {/* Read status filter */}
            <select
              value={filterReadStatus}
              onChange={(e) => setFilterReadStatus(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg neu-inset bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all" className="bg-slate-100 dark:bg-slate-800">{t.statusAll}</option>
              <option value="unread" className="bg-slate-100 dark:bg-slate-800">{t.statusUnreadOnly}</option>
              <option value="read" className="bg-slate-100 dark:bg-slate-800">{t.statusReadOnly}</option>
            </select>

            {/* Attachment filter */}
            <select
              value={filterAttachments}
              onChange={(e) => setFilterAttachments(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg neu-inset bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all" className="bg-slate-100 dark:bg-slate-800">{t.attachmentsAny}</option>
              <option value="with_attachments" className="bg-slate-100 dark:bg-slate-800">{t.attachmentsHas}</option>
            </select>

            {/* Sort order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg neu-inset bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="newest" className="bg-slate-100 dark:bg-slate-800">{t.sortNewest}</option>
              <option value="oldest" className="bg-slate-100 dark:bg-slate-800">{t.sortOldest}</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              {t.resetAllFilters}
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
          <span>{t.foundResults(filteredResults.length)}</span>
          <span>{t.indexedOver(messages.length)}</span>
        </div>

        {filteredResults.length === 0 ? (
          <EmptyState type="search" />
        ) : (
          <div className="space-y-3">
            {filteredResults.map((msg) => (
              <Link
                key={msg.id}
                href={`/inbox?id=${msg.id}`}
                className={`p-4 rounded-2xl neu-flat block transition-all duration-150 hover:translate-y-[-1px] ${
                  !msg.seen ? 'border-l-4 border-indigo-500' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {msg.from.name || msg.from.address}
                      </span>
                      {!msg.seen && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                          {t.filterUnread}
                        </span>
                      )}
                      {msg.hasAttachments && (
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {msg.subject || t.noSubject}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-2xl">
                      {msg.intro || t.noPreview}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                    <span className="font-mono">
                      {new Date(msg.createdAt).toLocaleDateString()}{' '}
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
