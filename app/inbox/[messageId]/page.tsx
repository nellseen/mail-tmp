'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMail } from '@/context/mail-context';
import { MailMessageDetail } from '@/lib/types';
import { EmailViewer } from '@/components/email-viewer';

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const messageId = params?.messageId as string;

  const { currentSession, markMessageRead, deleteMessage, settings, t } = useMail();

  const [message, setMessage] = useState<MailMessageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!messageId || !currentSession?.token) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(`/api/mail/messages/${messageId}`, {
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
        setMessage(data);
        if (!data.seen) {
          markMessageRead(data.id, true);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error loading message content');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [messageId, currentSession?.token, markMessageRead]);

  const handleBack = () => {
    router.push('/inbox');
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center rounded-2xl neu-inset">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {t.fetchingFromProvider}
        </p>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="p-8 rounded-2xl neu-inset text-center space-y-4 max-w-lg mx-auto my-8">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Message Not Found or Unavailable
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {error || 'This message could not be loaded from Mail.tm.'}
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 rounded-xl neu-button text-xs font-semibold"
        >
          {t.returnToInbox}
        </button>
      </div>
    );
  }

  return (
    <EmailViewer
      message={message}
      onBack={handleBack}
      onToggleRead={markMessageRead}
      onDelete={deleteMessage}
      blockRemoteImagesDefault={settings.blockRemoteImages}
    />
  );
}
