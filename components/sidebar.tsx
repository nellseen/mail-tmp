'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Inbox,
  LayoutDashboard,
  Search,
  AtSign,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ExternalLink,
  Mail,
  Zap,
  Globe,
} from 'lucide-react';
import { useMail } from '@/context/mail-context';
import { CopyButton } from './copy-button';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const {
    currentSession,
    unreadCount,
    isCreatingMailbox,
    settings,
    updateSettings,
    language,
    setLanguage,
    t,
  } = useMail();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      label: t.navDashboard,
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: t.navInbox,
      href: '/inbox',
      icon: Inbox,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      label: t.navSearch,
      href: '/search',
      icon: Search,
      badge: null,
    },
    {
      label: t.navAddresses,
      href: '/addresses',
      icon: AtSign,
      badge: null,
    },
    {
      label: t.navSettings,
      href: '/settings',
      icon: Settings,
      badge: null,
    },
    {
      label: t.navPrivacy,
      href: '/privacy',
      icon: ShieldCheck,
      badge: null,
    },
  ];

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: nextTheme });
  };

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Persistent Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out flex flex-col justify-between p-4 neu-flat border-r border-slate-300/30 dark:border-slate-800/60 ${
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-72'}`}
      >
        {/* Top Header & Branding */}
        <div>
          <div className="flex items-center justify-between mb-6 px-1">
            <Link
              href="/"
              onClick={onCloseMobile}
              className="flex items-center gap-3 overflow-hidden group"
              title="AetherMail Home"
            >
              <div className="w-10 h-10 rounded-xl neu-button-primary flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 block">
                    Aether<span className="text-indigo-600 dark:text-indigo-400">Mail</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block -mt-0.5">
                    {t.brandTagline}
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden md:flex p-1.5 rounded-xl neu-button text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Current Active Mailbox Quick Widget */}
          {!isCollapsed ? (
            <div className="mb-6 p-3.5 rounded-2xl neu-inset">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t.activeMailbox}
                </span>
                {currentSession && (
                  <CopyButton textToCopy={currentSession.address} label={t.copyAddress} />
                )}
              </div>
              <p
                className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate select-all"
                title={currentSession?.address || t.generatingAddress}
              >
                {isCreatingMailbox
                  ? t.generatingAddress
                  : currentSession?.address || t.noActiveMailbox}
              </p>
            </div>
          ) : (
            <div className="mb-6 flex justify-center">
              <div
                className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-emerald-500"
                title={`${t.activeMailbox}: ${currentSession?.address || t.generatingAddress}`}
              >
                <Zap className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'neu-pill-active font-bold text-indigo-600 dark:text-indigo-400'
                      : 'neu-button text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                  {item.badge !== null && !isCollapsed && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white shrink-0">
                      {item.badge}
                    </span>
                  )}
                  {item.badge !== null && isCollapsed && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Preferences, Language Switcher & Attribution */}
        <div className="pt-4 border-t border-slate-300/40 dark:border-slate-800/80 space-y-2.5">
          {/* Language Switcher Pill */}
          <div
            className={`flex items-center gap-2 p-1.5 rounded-xl neu-inset ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-1.5 pl-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>Bahasa / Lang</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                aria-label="Ganti bahasa ke Bahasa Indonesia"
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'id'
                    ? 'neu-pill-active text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                ID
              </button>
              <span className="text-[10px] text-slate-400">|</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                aria-label="Switch language to English"
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'neu-pill-active text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${settings.theme === 'light' ? 'dark' : 'light'} theme`}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold neu-button text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
            )}
            {!isCollapsed && (
              <span>{settings.theme === 'dark' ? t.lightMode : t.darkMode}</span>
            )}
          </button>

          {/* Provider & Creator Attribution with Link */}
          {!isCollapsed ? (
            <div className="p-3 rounded-xl neu-inset text-[11px] text-slate-500 dark:text-slate-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Infrastructure</span>
                <a
                  href="https://mail.tm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  Mail.tm
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="pt-1.5 border-t border-slate-300/40 dark:border-slate-800 flex items-center justify-between">
                <span>Created by <strong className="text-slate-800 dark:text-slate-200">Nells</strong></span>
                <a
                  href="https://www.instagram.com/tianshirrr_?vrfl=MXF1NjVuOWswdm95Zg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-pink-600 dark:text-pink-400 hover:underline inline-flex items-center gap-1"
                  title="Instagram: @tianshirrr_"
                >
                  @tianshirrr_
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <a
                href="https://www.instagram.com/tianshirrr_?vrfl=MXF1NjVuOWswdm95Zg=="
                target="_blank"
                rel="noopener noreferrer"
                title="Created by Nells (@tianshirrr_)"
                className="p-2 rounded-xl neu-inset text-pink-500 hover:text-pink-600"
              >
                <span className="font-bold text-xs">N</span>
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
