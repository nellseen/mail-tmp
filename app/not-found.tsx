import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
      <div className="p-4 rounded-2xl neu-inset">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200">404</h2>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Page not found / Halaman tidak ditemukan
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl text-xs font-bold neu-button-primary inline-flex items-center"
      >
        Return to Home / Kembali ke Beranda
      </Link>
    </div>
  );
}
