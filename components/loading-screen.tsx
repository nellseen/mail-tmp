'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Instagram, Sparkles, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export function LoadingScreen({ onComplete, minDurationMs = 2600 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(15);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const statuses = [
    'Menyiapkan arsitektur AetherMail...',
    'Menghubungkan ke gateway jaringan Mail.tm...',
    'Mengaktifkan pelindung privasi & pemblokir pelacak...',
    'Kotak masuk siap digunakan!',
  ];

  useEffect(() => {
    // Progress increment timer
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const step = Math.floor(Math.random() * 20) + 12;
        return Math.min(100, prev + step);
      });
    }, 380);

    // Status rotation timer
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1 < statuses.length ? prev + 1 : prev));
    }, 650);

    // Complete timer
    const finishTimeout = setTimeout(() => {
      setIsFinished(true);
      // Wait for exit transition
      const exitTimeout = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 400);
      return () => clearTimeout(exitTimeout);
    }, minDurationMs);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      clearTimeout(finishTimeout);
    };
  }, [minDurationMs, onComplete, statuses.length]);

  const handleSkip = () => {
    setIsFinished(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-main)] transition-opacity duration-400 ${
        isFinished ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Loading AetherMail"
    >
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl neu-elevated relative overflow-hidden space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Icon with Soft Pulsing Glow */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl neu-button-primary flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Mail className="w-8 h-8 text-white stroke-[2.2] animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
          </span>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Aether<span className="text-indigo-600 dark:text-indigo-400">Mail</span>
          </h1>
          <p className="text-xs uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
            Disposable Email Engine
          </p>
        </div>

        {/* Progress Bar & Status Text */}
        <div className="space-y-2.5">
          <div className="w-full h-2.5 rounded-full neu-inset overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">
            <span className="truncate">{statuses[statusIndex]}</span>
            <span className="font-mono">{progress}%</span>
          </div>
        </div>

        {/* ABOUT ME SECTION - NELLS & INSTAGRAM */}
        <div className="p-4 rounded-2xl neu-inset text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Avatar Initial N */}
              <div className="w-9 h-9 rounded-xl neu-button-primary flex items-center justify-center font-black text-sm text-white shrink-0">
                N
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                    Nells
                  </h3>
                  <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-indigo-600 text-white">
                    Creator
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Developer & UI Designer
                </p>
              </div>
            </div>

            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Aplikasi email sementara ini dirancang dengan sistem visual Soft Neumorphism premium dan integrasi Mail.tm langsung oleh <strong>Nells</strong>.
          </p>

          {/* Social Media Link: Instagram */}
          <div className="pt-2 border-t border-slate-300/40 dark:border-slate-800 flex items-center justify-between">
            <a
              href="https://www.instagram.com/tianshirrr_?vrfl=MXF1NjVuOWswdm95Zg=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-button text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 transition-all"
              title="Kunjungi Instagram Nells (@tianshirrr_)"
            >
              <Instagram className="w-3.5 h-3.5 shrink-0" />
              <span>@tianshirrr_</span>
            </a>

            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom subtle note */}
        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Crafted with</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          <span>by Nells • Ready for Vercel</span>
        </div>
      </div>
    </div>
  );
}
