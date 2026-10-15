'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  MailAccount,
  MailDomain,
  MailMessageSummary,
  StoredMailboxSession,
  AppSettings,
} from '@/lib/types';
import { playNotificationSound } from '@/lib/sound';

import { Language, getTranslation, translations } from '@/lib/i18n';

const STORAGE_KEY_SESSION = 'aethermail_current_session';
const STORAGE_KEY_SAVED = 'aethermail_saved_sessions';
const STORAGE_KEY_SETTINGS = 'aethermail_app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  refreshInterval: 15, // 15 seconds polling interval
  soundAlerts: true,
  browserNotifications: false,
  blockRemoteImages: true,
  interfaceDensity: 'comfortable',
  language: 'id',
};

interface MailContextType {
  currentSession: StoredMailboxSession | null;
  savedSessions: StoredMailboxSession[];
  account: MailAccount | null;
  messages: MailMessageSummary[];
  totalMessages: number;
  unreadCount: number;
  isLoadingMessages: boolean;
  isCreatingMailbox: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncError: string | null;
  domains: MailDomain[];
  isLoadingDomains: boolean;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)['id'];
  createRandomMailbox: (customUsername?: string, chosenDomain?: string, customPassword?: string) => Promise<StoredMailboxSession>;
  loginMailbox: (address: string, password: string) => Promise<void>;
  switchMailbox: (session: StoredMailboxSession) => Promise<void>;
  deleteMailboxAccount: () => Promise<void>;
  refreshMessages: (silent?: boolean) => Promise<void>;
  markMessageRead: (id: string, seen: boolean) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  clearSavedSessions: () => void;
  fetchDomains: () => Promise<MailDomain[]>;
}

const MailContext = createContext<MailContextType | null>(null);

export function MailProvider({ children }: { children: React.ReactNode }) {
  const [currentSession, setCurrentSession] = useState<StoredMailboxSession | null>(null);
  const [savedSessions, setSavedSessions] = useState<StoredMailboxSession[]>([]);
  const [account, setAccount] = useState<MailAccount | null>(null);
  const [messages, setMessages] = useState<MailMessageSummary[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isCreatingMailbox, setIsCreatingMailbox] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [domains, setDomains] = useState<MailDomain[]>([]);
  const [isLoadingDomains, setIsLoadingDomains] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Keep a ref to previous message IDs to accurately detect new arrivals
  const previousMessageIdsRef = useRef<Set<string>>(new Set());
  const isPollingRef = useRef(false);

  // 1. Load initial settings and saved sessions from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (storedSettings) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(storedSettings) }));
      }

      const storedSaved = localStorage.getItem(STORAGE_KEY_SAVED);
      if (storedSaved) {
        setSavedSessions(JSON.parse(storedSaved));
      }

      const storedCurrent = localStorage.getItem(STORAGE_KEY_SESSION);
      if (storedCurrent) {
        setCurrentSession(JSON.parse(storedCurrent));
      }
    } catch {
      // localStorage unavailable or parse failed
    } finally {
      setHasInitialized(true);
    }
  }, []);

  // 2. Apply theme class to documentElement whenever settings.theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
      let isDark = false;
      if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = theme === 'dark';
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(settings.theme);

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  // 3. Save settings updates
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      } catch {
        // storage error
      }
      return updated;
    });
  }, []);

  // 4. Fetch live domains
  const fetchDomains = useCallback(async (): Promise<MailDomain[]> => {
    setIsLoadingDomains(true);
    try {
      const res = await fetch('/api/mail/domains');
      if (!res.ok) {
        throw new Error(`Failed to load domains: ${res.statusText}`);
      }
      const data = await res.json();
      const activeDomains = (data.domains || []).filter((d: MailDomain) => d.isActive);
      setDomains(activeDomains);
      return activeDomains;
    } catch (err: unknown) {
      console.error('Error fetching domains:', err);
      return [];
    } finally {
      setIsLoadingDomains(false);
    }
  }, []);

  // Fetch domains on initial load
  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // 5. Fetch messages for current session
  const refreshMessages = useCallback(
    async (silent = false) => {
      if (!currentSession?.token) return;
      if (isPollingRef.current) return;

      isPollingRef.current = true;
      if (!silent) {
        setIsSyncing(true);
      }
      setSyncError(null);

      try {
        const [msgRes, meRes] = await Promise.all([
          fetch('/api/mail/messages?page=1', {
            headers: { Authorization: `Bearer ${currentSession.token}` },
          }),
          fetch('/api/mail/me', {
            headers: { Authorization: `Bearer ${currentSession.token}` },
          }),
        ]);

        if (msgRes.status === 401 || meRes.status === 401) {
          setSyncError('Mailbox session has expired. Please regenerate or re-login.');
          return;
        }

        if (!msgRes.ok) {
          const errData = await msgRes.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${msgRes.status}`);
        }

        const msgData = await msgRes.json();
        const incomingMessages: MailMessageSummary[] = msgData.messages || [];

        // Check for new incoming messages
        const prevIds = previousMessageIdsRef.current;
        if (prevIds.size > 0) {
          const brandNew = incomingMessages.filter((m) => !prevIds.has(m.id));
          if (brandNew.length > 0) {
            // Play chime if enabled
            if (settings.soundAlerts) {
              playNotificationSound();
            }

            // Show system notification if granted
            if (
              settings.browserNotifications &&
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              const latest = brandNew[0];
              new Notification(`New Email: ${latest.subject || '(No Subject)'}`, {
                body: `From: ${latest.from.name || latest.from.address}\n${latest.intro || ''}`,
                icon: '/favicon.ico',
              });
            }
          }
        }

        // Update previous IDs set
        previousMessageIdsRef.current = new Set(incomingMessages.map((m) => m.id));

        setMessages(incomingMessages);
        setTotalMessages(msgData.totalItems || incomingMessages.length);
        setLastSyncedAt(new Date());

        if (meRes.ok) {
          const meData = await meRes.json();
          setAccount(meData);
        }
      } catch (err: unknown) {
        setSyncError((err as Error).message || 'Failed to sync with Mail.tm');
      } finally {
        setIsSyncing(false);
        setIsLoadingMessages(false);
        isPollingRef.current = false;
      }
    },
    [currentSession, settings.soundAlerts, settings.browserNotifications]
  );

  // 6. Create Random or Custom Mailbox
  const createRandomMailbox = useCallback(
    async (
      customUsername?: string,
      chosenDomain?: string,
      customPassword?: string
    ): Promise<StoredMailboxSession> => {
      setIsCreatingMailbox(true);
      setSyncError(null);

      try {
        let domainToUse = chosenDomain;
        if (!domainToUse) {
          let available = domains;
          if (available.length === 0) {
            available = await fetchDomains();
          }
          if (available.length === 0) {
            throw new Error('No active email domains available from provider. Please retry in a moment.');
          }
          domainToUse = available[0].domain;
        }

        // Generate clean random username if not supplied
        const cleanUser = (
          customUsername?.trim().toLowerCase() ||
          `user_${Math.random().toString(36).substring(2, 10)}`
        ).replace(/[^a-z0-9._-]/g, '');

        const address = `${cleanUser}@${domainToUse}`;
        // Use custom user-supplied password or generate strong secure password
        const password = customPassword?.trim()
          ? customPassword.trim()
          : `Pass_${Math.random().toString(36).substring(2, 12)}!${Math.floor(Math.random() * 899 + 100)}`;

        const res = await fetch('/api/mail/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create temporary mailbox');
        }

        const newSession: StoredMailboxSession = {
          id: data.account.id,
          address: data.account.address,
          token: data.token,
          password,
          createdAt: new Date().toISOString(),
        };

        // Update state and persistence
        setCurrentSession(newSession);
        setAccount(data.account);
        setMessages([]);
        setTotalMessages(0);
        previousMessageIdsRef.current = new Set();
        setLastSyncedAt(new Date());

        try {
          localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newSession));
          setSavedSessions((prev) => {
            const filtered = prev.filter((s) => s.address !== newSession.address);
            const nextList = [newSession, ...filtered].slice(0, 10); // keep up to 10 recent
            localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(nextList));
            return nextList;
          });
        } catch {
          // ignore storage error
        }

        return newSession;
      } finally {
        setIsCreatingMailbox(false);
      }
    },
    [domains, fetchDomains]
  );

  // 7. Login to Existing Mailbox
  const loginMailbox = useCallback(
    async (address: string, password: string) => {
      setIsCreatingMailbox(true);
      setSyncError(null);

      try {
        const res = await fetch('/api/mail/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: address.trim().toLowerCase(), password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid credentials or mailbox not found');
        }

        const newSession: StoredMailboxSession = {
          id: data.account?.id || '',
          address: data.account?.address || address,
          token: data.token,
          password,
          createdAt: data.account?.createdAt || new Date().toISOString(),
        };

        setCurrentSession(newSession);
        setAccount(data.account);
        setMessages([]);
        setTotalMessages(0);
        previousMessageIdsRef.current = new Set();

        try {
          localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newSession));
          setSavedSessions((prev) => {
            const filtered = prev.filter((s) => s.address !== newSession.address);
            const nextList = [newSession, ...filtered].slice(0, 10);
            localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(nextList));
            return nextList;
          });
        } catch {
          // ignore
        }
      } finally {
        setIsCreatingMailbox(false);
      }
    },
    []
  );

  // 8. Switch to one of the saved sessions
  const switchMailbox = useCallback(
    async (session: StoredMailboxSession) => {
      setCurrentSession(session);
      setMessages([]);
      setTotalMessages(0);
      previousMessageIdsRef.current = new Set();
      try {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      } catch {
        // ignore
      }
    },
    []
  );

  // 9. Delete active mailbox on Mail.tm
  const deleteMailboxAccount = useCallback(async () => {
    if (!currentSession) return;
    setIsCreatingMailbox(true);

    try {
      const res = await fetch(`/api/mail/accounts?id=${currentSession.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${currentSession.token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete mailbox account from provider');
      }

      // Remove from saved sessions
      const nextSaved = savedSessions.filter((s) => s.address !== currentSession.address);
      setSavedSessions(nextSaved);
      try {
        localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(nextSaved));
        localStorage.removeItem(STORAGE_KEY_SESSION);
      } catch {
        // ignore
      }

      // Automatically create a fresh replacement mailbox
      await createRandomMailbox();
    } finally {
      setIsCreatingMailbox(false);
    }
  }, [currentSession, savedSessions, createRandomMailbox]);

  // 10. Mark message as read/unread
  const markMessageRead = useCallback(
    async (id: string, seen: boolean) => {
      if (!currentSession?.token) return;

      // Optimistic UI update
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, seen } : msg))
      );

      try {
        const res = await fetch(`/api/mail/messages/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentSession.token}`,
          },
          body: JSON.stringify({ seen }),
        });

        if (!res.ok) {
          // Revert optimistic update
          setMessages((prev) =>
            prev.map((msg) => (msg.id === id ? { ...msg, seen: !seen } : msg))
          );
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to update message status');
        }
      } catch (err: unknown) {
        setSyncError((err as Error).message);
      }
    },
    [currentSession]
  );

  // 11. Delete individual message
  const deleteMessage = useCallback(
    async (id: string) => {
      if (!currentSession?.token) return;

      // Optimistic removal
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      setTotalMessages((prev) => Math.max(0, prev - 1));

      try {
        const res = await fetch(`/api/mail/messages/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${currentSession.token}`,
          },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to delete message from provider');
        }
      } catch (err: unknown) {
        setSyncError((err as Error).message);
        // Refresh to restore accurate state
        refreshMessages(true);
      }
    },
    [currentSession, refreshMessages]
  );

  // 12. Clear saved sessions history
  const clearSavedSessions = useCallback(() => {
    setSavedSessions([]);
    try {
      localStorage.removeItem(STORAGE_KEY_SAVED);
    } catch {
      // ignore
    }
  }, []);

  // 13. Auto initialize mailbox if none exists once hydrated
  useEffect(() => {
    if (!hasInitialized) return;
    if (!currentSession) {
      createRandomMailbox().catch((err) => {
        console.error('Initial mailbox creation error:', err);
      });
    } else {
      setIsLoadingMessages(true);
      refreshMessages(false);
    }
  }, [hasInitialized, currentSession?.address]); // eslint-disable-line react-hooks/exhaustive-deps

  // 14. Periodic polling with visibility awareness and rate limit protection
  useEffect(() => {
    if (!currentSession?.token) return;
    if (settings.refreshInterval <= 0) return;

    const intervalMs = settings.refreshInterval * 1000;

    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshMessages(true);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [currentSession?.token, settings.refreshInterval, refreshMessages]);

  const unreadCount = messages.filter((m) => !m.seen).length;

  const currentLang: Language = settings.language || 'id';
  const t = getTranslation(currentLang);
  const setLanguage = useCallback(
    (lang: Language) => {
      updateSettings({ language: lang });
    },
    [updateSettings]
  );

  return (
    <MailContext.Provider
      value={{
        currentSession,
        savedSessions,
        account,
        messages,
        totalMessages,
        unreadCount,
        isLoadingMessages,
        isCreatingMailbox,
        isSyncing,
        lastSyncedAt,
        syncError,
        domains,
        isLoadingDomains,
        settings,
        updateSettings,
        language: currentLang,
        setLanguage,
        t,
        createRandomMailbox,
        loginMailbox,
        switchMailbox,
        deleteMailboxAccount,
        refreshMessages,
        markMessageRead,
        deleteMessage,
        clearSavedSessions,
        fetchDomains,
      }}
    >
      {children}
    </MailContext.Provider>
  );
}

export function useMail() {
  const context = useContext(MailContext);
  if (!context) {
    throw new Error('useMail must be used within a MailProvider');
  }
  return context;
}
