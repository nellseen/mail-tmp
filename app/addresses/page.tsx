'use client';

import React, { useState } from 'react';
import {
  AtSign,
  Plus,
  KeyRound,
  Trash2,
  AlertCircle,
  ShieldAlert,
  HardDrive,
  Calendar,
  Eye,
  EyeOff,
  Sparkles,
  Dices,
} from 'lucide-react';
import { useMail } from '@/context/mail-context';
import { CopyButton } from '@/components/copy-button';
import { ConfirmModal } from '@/components/confirm-modal';

export default function AddressesPage() {
  const {
    currentSession,
    savedSessions,
    account,
    domains,
    isLoadingDomains,
    isCreatingMailbox,
    createRandomMailbox,
    loginMailbox,
    switchMailbox,
    deleteMailboxAccount,
    clearSavedSessions,
    t,
  } = useMail();

  // Mode tabs: 'create' | 'login'
  const [activeTab, setActiveTab] = useState<'create' | 'login'>('create');

  // Custom create state
  const [customUsername, setCustomUsername] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [showCustomPassword, setShowCustomPassword] = useState(false);
  const [showActivePassword, setShowActivePassword] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Login state
  const [loginAddress, setLoginAddress] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRandomizeUsername = () => {
    setCustomUsername(`user_${Math.random().toString(36).substring(2, 9)}`);
  };

  const handleGenerateStrongPassword = () => {
    const strong = `Pass_${Math.random().toString(36).substring(2, 8)}!${Math.floor(Math.random() * 899 + 100)}`;
    setCustomPassword(strong);
    setShowCustomPassword(true);
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (customPassword && customPassword.length < 6) {
      setCreateError(t.passwordMinChars);
      return;
    }

    try {
      const domain = selectedDomain || (domains.length > 0 ? domains[0].domain : undefined);
      await createRandomMailbox(
        customUsername.trim() || undefined,
        domain,
        customPassword.trim() || undefined
      );
      setCustomUsername('');
      setCustomPassword('');
    } catch (err: unknown) {
      setCreateError((err as Error).message || 'Failed to create address');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginAddress || !loginPassword) {
      setLoginError('Both email address and password are required.');
      return;
    }

    try {
      await loginMailbox(loginAddress, loginPassword);
      setLoginAddress('');
      setLoginPassword('');
    } catch (err: unknown) {
      setLoginError((err as Error).message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleDeleteActiveMailbox = async () => {
    setIsDeleting(true);
    try {
      await deleteMailboxAccount();
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {t.addressesTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t.addressesSubtitle}
        </p>
      </div>

      {/* Active Mailbox Banner Card */}
      {currentSession && (
        <div className="p-6 rounded-2xl neu-elevated space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t.currentActiveMailbox}</span>
              </div>
              <p className="font-mono text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 select-all truncate">
                {currentSession.address}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <CopyButton textToCopy={currentSession.address} label={t.copyAddress} showText />
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold neu-button text-rose-500 hover:text-rose-600 inline-flex items-center gap-1.5"
                title={t.deleteMailbox}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.deleteMailbox}</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-300/40 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{t.created} {new Date(currentSession.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                {t.storage} {account ? `${(account.used / 1024).toFixed(1)} KB` : t.allocated}
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-hidden">
              <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="shrink-0">{t.password}</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                {currentSession.password
                  ? showActivePassword
                    ? currentSession.password
                    : '••••••••••••'
                  : t.managed}
              </span>
              {currentSession.password && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowActivePassword(!showActivePassword)}
                    aria-label={showActivePassword ? t.hidePassword : t.showPassword}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 shrink-0"
                  >
                    {showActivePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <CopyButton textToCopy={currentSession.password} label={t.copyPassword} />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Creation and Login Section */}
      <div className="p-6 rounded-2xl neu-flat space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-300/40 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'create' ? 'neu-pill-active' : 'neu-button text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.createNewAddressTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'login' ? 'neu-pill-active' : 'neu-button text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.loginExistingTab}
          </button>
        </div>

        {activeTab === 'create' ? (
          <form onSubmit={handleCreateCustom} className="space-y-4 max-w-xl">
            {/* Username and Domain Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <label htmlFor="addr-username">{t.chooseUsernameAndDomain}</label>
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
                  id="addr-username"
                  type="text"
                  placeholder={t.usernamePlaceholder}
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                  className="flex-1 px-3.5 py-2.5 rounded-xl neu-inset bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                />
                <span className="text-sm font-bold text-slate-400 text-center sm:text-left">@</span>
                <select
                  value={selectedDomain || (domains[0]?.domain || '')}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  disabled={isLoadingDomains || domains.length === 0}
                  className="px-3.5 py-2.5 rounded-xl neu-inset bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {domains.map((d) => (
                    <option key={d.id} value={d.domain} className="bg-slate-100 dark:bg-slate-800">
                      {d.domain}
                    </option>
                  ))}
                  {domains.length === 0 && (
                    <option value="">{isLoadingDomains ? 'Loading domains...' : 'No domains'}</option>
                  )}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.liveDomainsNote}
              </p>
            </div>

            {/* Password Input with show/hide and generator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <label htmlFor="addr-password">{t.customPasswordLabel}</label>
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
                  id="addr-password"
                  type={showCustomPassword ? 'text' : 'password'}
                  placeholder={t.customPasswordPlaceholder}
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl neu-inset bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCustomPassword(!showCustomPassword)}
                  aria-label={showCustomPassword ? t.hidePassword : t.showPassword}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showCustomPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                <span>{t.rememberPasswordNote}</span>
                {customPassword && customPassword.length < 6 && (
                  <span className="text-rose-500 font-semibold">{t.passwordMinChars}</span>
                )}
              </div>
            </div>

            {createError && (
              <div className="p-3 rounded-xl neu-inset text-rose-500 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isCreatingMailbox || (Boolean(customPassword) && customPassword.length < 6)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold neu-button-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreatingMailbox ? t.allocatingOnProvider : t.createAddressBtn}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.emailAddressLabel}
              </label>
              <input
                type="email"
                placeholder="user@domain.com"
                value={loginAddress}
                onChange={(e) => setLoginAddress(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder={t.passwordPlaceholder}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl neu-inset bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? t.hidePassword : t.showPassword}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl neu-inset text-rose-500 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isCreatingMailbox}
              className="px-5 py-2.5 rounded-xl text-xs font-bold neu-button-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isCreatingMailbox ? t.authenticating : t.signInMailboxBtn}</span>
            </button>
          </form>
        )}
      </div>

      {/* Saved Mailboxes in Current Session */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.recentMailboxesSession} ({savedSessions.length})
          </h2>
          {savedSessions.length > 0 && (
            <button
              type="button"
              onClick={clearSavedSessions}
              className="text-xs font-medium text-slate-500 hover:text-rose-500"
            >
              {t.clearHistory}
            </button>
          )}
        </div>

        {savedSessions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl neu-inset text-xs text-slate-500">
            {t.noSavedMailboxes}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedSessions.map((session) => {
              const isActive = session.address === currentSession?.address;

              return (
                <div
                  key={session.address}
                  className={`p-4 rounded-2xl neu-flat flex items-center justify-between gap-3 ${
                    isActive ? 'border-l-4 border-emerald-500' : ''
                  }`}
                >
                  <div className="overflow-hidden space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {session.address}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                          {t.statusActive}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{t.created} {new Date(session.createdAt).toLocaleDateString()}</span>
                      {session.password && (
                        <span>• Password: {session.password}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <CopyButton textToCopy={session.address} label={t.copyAddress} />
                    {session.password && (
                      <CopyButton textToCopy={session.password} label={t.copyPassword} />
                    )}
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => switchMailbox(session)}
                        className="px-3 py-1.5 rounded-xl neu-button text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                      >
                        {t.switchBtn}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Critical Security & Retention Notice */}
      <div className="p-5 rounded-2xl neu-inset flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-400">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {t.retentionWarningTitle}
          </p>
          <p className="leading-relaxed">
            {t.retentionWarningDesc}
          </p>
        </div>
      </div>

      {/* Confirmation Modal for Permanent Account Deletion */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title={t.deleteAccountModalTitle}
        description={t.deleteAccountModalDesc(currentSession?.address || '')}
        confirmLabel={t.deleteMailbox}
        cancelLabel={t.cancel}
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDeleteActiveMailbox}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
