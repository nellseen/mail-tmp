# Panduan Deploy ke Vercel (Vercel Deployment Guide)

Proyek **AetherMail** siap 100% untuk dideploy langsung ke **Vercel** hanya dengan beberapa langkah sederhana:

---

## Cara Deploy ke Vercel

### Metode 1: Import via Git (GitHub / GitLab / Bitbucket) — Direkomendasikan
1. Push repositori ini ke akun GitHub Anda.
2. Buka dashboard [Vercel](https://vercel.com/) lalu klik **"Add New..." > "Project"**.
3. Pilih repositori **AetherMail** dari daftar GitHub Anda.
4. Vercel akan secara otomatis mendeteksi pengaturan:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Klik tombol **"Deploy"**.
6. Proyek Anda akan selesai dibuild dan online dalam 1-2 menit dengan domain otomatis `*.vercel.app`!

---

### Metode 2: Deploy via Vercel CLI
Jika Anda menggunakan terminal lokal:
```bash
# 1. Install Vercel CLI jika belum terpasang
npm install -g vercel

# 2. Login ke akun Vercel Anda
vercel login

# 3. Jalankan perintah deploy
vercel
```

---

## Verifikasi Kesiapan Vercel

- ✅ **Framework**: Next.js 15+ App Router dengan file `vercel.json` dan konfigurasi `next.config.ts`.
- ✅ **API Serverless**: Endpoint `/api/mail/*` menggunakan `export const dynamic = 'force-dynamic'` yang kompatibel dengan Vercel Serverless Functions.
- ✅ **Ketergantungan Eksternal**: Tidak memerlukan database terpisah atau kredensial berbayar; sistem langsung terhubung ke API publik Mail.tm secara aman dan mandiri.
- ✅ **Lulus Uji Produksi**: Kompilasi build `npm run build` dan seluruh pengujian `npm test` lulus 100%.
