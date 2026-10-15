'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  KeyRound,
  Eye,
  EyeOff,
  Dices,
  Sparkles,
  AlertCircle,
  AtSign,
  ShieldCheck,
} from 'lucide-react';
import { useMail } from '@/context/mail-context';

interface NewMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewMailboxModal({ isOpen, onClose }: NewMailboxModalProps) {
  const { domains, isLoadingDomains, isCreatingMailbox, createRandomMailbox, t } = useMail();

  const [username, setUsername] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize defaults on open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (domains.length > 0 && !selectedDomain) {
        setSelectedDomain(domains[0].domain);
      }
    }
  }, [isOpen, domains, selectedDomain]);

  if (!isOpen) return null;

  const currentDomain = selectedDomain || (domains[0]?.domain || '');
  const previewAddress = `${username.trim().toLowerCase() || 'username'}@${currentDomain || 'domain.com'}`;

  const handleRandomizeUsername = () => {
    const randomUser = `user_${Math.random().toString(36).substring(2, 9)}`;
    setUsername(randomUser);
  };

  const handleGenerateStrongPassword = () => {
    const strong = `Pass_${Math.random().toString(36).substring(2, 8)}!${Math.floor(Math.random() * 899 + 100)}`;
    setPassword(strong);
    setShowPassword(true); // show so user sees what was generated
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password && password.length < 6) {
      setError(t.passwordMinChars);
      return;
    }

    try {
      await createRandomMailbox(
        username.trim() || undefined,
        currentDomain || undefined,
        password.trim() || undefined
      );
      // Reset & close
      setUsername('');
      setPassword('');
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create mailbox');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs transition-opacity">
      <div
        className="w-full max-w-lg p-6 sm:p-7 rounded-3xl neu-elevated relative animate-in fade-in zoom-in-95 duration-150 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-mailbox-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isCreatingMailbox}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-xl neu-button text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="p-3 rounded-2xl neu-inset text-indigo-600 dark:text-indigo-400 shrink-0">
            <AtSign className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h2 id="new-mailbox-title" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              {t.newMailboxModalTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t.newMailboxModalSubtitle}
            </p>
          </div>
        </div>

        {/* Live Preview Pill */}
        <div className="p-3 rounded-xl neu-inset flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Email:</span>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate">
            {previewAddress}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username & Domain Inputs */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <label htmlFor="mailbox-username">Username & Domain</label>
              <button
                type="button"
                onClick={handleRandomizeUsername}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>{t.randomizeUsername}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                id="mailbox-username"
                type="text"
                placeholder="e.g. myalias2026"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                className="flex-1 px-3.5 py-2.5 rounded-xl neu-inset bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
              />
              <span className="text-sm font-bold text-slate-400 text-center sm:text-left">@</span>
              <select
                value={currentDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                disabled={isLoadingDomains || domains.length === 0}
                className="px-3.5 py-2.5 rounded-xl neu-inset bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {domains.map((d) => (
                  <option key={d.id} value={d.domain} className="bg-slate-100 dark:bg-slate-800">
                    {d.domain}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <label htmlFor="mailbox-password">{t.customPasswordLabel}</label>
              <button
                type="button"
                onClick={handleGenerateStrongPassword}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.generateStrongPassword}</span>
              </button>
            </div>

            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="mailbox-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t.customPasswordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl neu-inset bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span>{t.rememberPasswordNote}</span>
              {password && password.length < 6 && (
                <span className="text-rose-500 font-semibold">{t.passwordMinChars}</span>
              )}
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 rounded-xl neu-inset text-rose-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreatingMailbox}
              className="px-4 py-2.5 rounded-xl neu-button text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-50"
            >
              {t.cancel}
            </button>

            <button
              type="submit"
              disabled={isCreatingMailbox || (Boolean(password) && password.length < 6)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold neu-button-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {isCreatingMailbox ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  <span>{t.allocatingOnProvider}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{t.createAddressBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
