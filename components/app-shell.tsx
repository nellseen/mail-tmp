'use client';

import React, { useState, useEffect } from 'react';
import { MailProvider } from '@/context/mail-context';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { LoadingScreen } from './loading-screen';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  // Allow re-showing or checking session
  useEffect(() => {
    // If user already viewed loading screen in this session, keep it brief or allow viewing
    const hasSeenSplash = sessionStorage.getItem('aethermail_splash_seen');
    if (hasSeenSplash) {
      setShowLoadingScreen(false);
    }
  }, []);

  const handleLoadingComplete = () => {
    try {
      sessionStorage.setItem('aethermail_splash_seen', 'true');
    } catch {
      // ignore
    }
    setShowLoadingScreen(false);
  };

  return (
    <MailProvider>
      {showLoadingScreen && (
        <LoadingScreen onComplete={handleLoadingComplete} minDurationMs={2400} />
      )}

      <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-main)] text-[var(--text-primary)] antialiased transition-colors duration-200">
        {/* Left Persistent Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <TopBar onOpenMobile={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </MailProvider>
  );
}
