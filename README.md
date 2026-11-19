# UPGamez Starter

Starter project website top-up game: GitHub + Cloudflare Pages/Worker + Google Apps Script + Google Sheets.

## Komponen
- `public/`: frontend website dan dashboard admin.
- `cloudflare/worker.js`: API proxy, menyimpan password admin dan meneruskan request ke Apps Script.
- `appscript/Code.gs`: backend dan akses Google Sheets.

## Urutan pemasangan
1. Buat Google Sheet kosong, salin ID dari URL.
2. Buat Apps Script, tempel `appscript/Code.gs`.
3. Di Apps Script > Project Settings > Script Properties, isi:
   - `SPREADSHEET_ID` = ID Google Sheet
   - `API_SECRET` = rahasia acak panjang milik sendiri
4. Jalankan fungsi `setupDatabase` sekali dan izinkan akses.
5. Deploy Apps Script sebagai Web app: Execute as Me; Who has access: Anyone. Salin URL deployment `/exec`.
6. Upload folder `public` sebagai project GitHub.
7. Buat Cloudflare Pages project dari GitHub: Root directory `public`, Build command kosong, Output directory `.`.
8. Buat Cloudflare Worker dan tempel `cloudflare/worker.js`.
9. Worker Settings > Variables and Secrets:
   - `APPS_SCRIPT_URL` = URL Web App Apps Script
   - `API_SECRET` = nilai rahasia yang sama
   - `ADMIN_PASSWORD` = password admin kuat milik sendiri (set sebagai Secret)
10. Deploy Worker. Salin URL `https://nama-worker.nama-akun.workers.dev`, lalu ganti nilai `API` di baris pertama `public/app.js` dan `public/admin.js` menjadi URL tersebut ditambah `/api`. Commit perubahan ke GitHub agar Pages deploy ulang.
11. Setelah API aktif, buka website dan `/admin.html`.

## Catatan keamanan dan batas starter
- Jangan pernah commit rahasia ke GitHub.
- Starter ini memakai pemeriksaan password admin sederhana di Worker dan HTTPS; gunakan password kuat dan jangan bagikan.
- Pembayaran manual perlu diverifikasi admin secara nyata.
- Status pesanan yang diubah admin belum otomatis mengirim top-up Digiflazz. Integrasi Digiflazz memerlukan kredensial resmi, endpoint, validasi signature, cek saldo, dan callback/status transaksi.
- Sebelum menerima uang pelanggan, uji semua alur dengan transaksi dummy.
